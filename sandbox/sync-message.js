{
    const BASE_URL_SUFFIX = "__SyncMessageServiceWorkerInput__"
    const VERSION = "__sync-message-v2__"

    /**
     * Checks whether the given request is meant to be intercepted by the sync-message serviceWorkerFetchListener.
     */
    function isServiceWorkerRequest(request) {
        if (typeof request !== "string") {
            request = request.request.url
        }
        return request.includes(BASE_URL_SUFFIX)
    }

    /**
     * Returns a function that can respond to fetch events in a service worker event listener.
     * The function returns true if the request came from this library and it responded.
     * Call `serviceWorkerFetchListener` and reuse the returned function as it manages internal state.
     */
    function serviceWorkerFetchListener() {
        const earlyMessages = {}
        const resolvers = {}

        return e => {
            const {
                url
            } = e.request
            if (!isServiceWorkerRequest(url)) {
                return false
            }

            async function respond() {
                function success(message) {
                    const response = {
                        message,
                        version: VERSION
                    }
                    return new Response(JSON.stringify(response), {
                        status: 200
                    })
                }

                if (url.endsWith("/read")) {
                    const {
                        messageId,
                        timeout
                    } = await e.request.json()
                    if (messageId in earlyMessages) {
                        const message = earlyMessages[messageId]
                        delete earlyMessages[messageId]
                        return success(message)
                    } else {
                        return await new Promise(resolver => {
                            resolvers[messageId] = resolver

                            function callback() {
                                delete resolvers[messageId]
                                resolver(new Response("", {
                                    status: 408
                                })) // timeout
                            }

                            setTimeout(callback, timeout)
                        })
                    }
                } else if (url.endsWith("/write")) {
                    const {
                        message,
                        messageId
                    } = await e.request.json()
                    const resolver = resolvers[messageId]
                    if (resolver) {
                        resolver(success(message))
                        delete resolvers[messageId]
                    } else {
                        earlyMessages[messageId] = message
                    }
                    return success({
                        early: !resolver
                    })
                } else if (url.endsWith("/version")) {
                    return new Response(VERSION, {
                        status: 200
                    })
                }
            }

            e.respondWith(respond())
            return true
        }
    }

    /**
     * Convenience function that allows writing `await asyncSleep(1000)`
     * to wait one second before continuing in an async function.
     */
    function asyncSleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    class ServiceWorkerError extends Error {
        // To avoid having to use instanceof
        type = "ServiceWorkerError"

        constructor(url, status) {
            super(
                `Received status ${status} from ${url}. Ensure the service worker is registered and active.`
            )
            this.url = url
            this.status = status
            // See https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work for info about this workaround.
            Object.setPrototypeOf(this, ServiceWorkerError.prototype)
        }
    }

    function writeMessageAtomics(channel, message) {
        const encoder = new TextEncoder()
        const bytes = encoder.encode(JSON.stringify(message))
        const {
            data,
            meta
        } = channel
        if (bytes.length > data.length) {
            throw new Error(
                "Message is too big, increase bufferSize when making channel."
            )
        }
        data.set(bytes, 0)
        Atomics.store(meta, 0, bytes.length)
        Atomics.store(meta, 1, 1)
        Atomics.notify(meta, 1)
    }

    async function writeMessageServiceWorker(channel, message, messageId) {
        await navigator.serviceWorker.ready
        const url = channel.baseUrl + "/write"
        const startTime = Date.now()
        while (true) {
            const request = {
                message,
                messageId
            }
            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(request)
            })
            if (
                response.status === 200 &&
                (await response.json()).version === VERSION
            ) {
                return
            }
            if (Date.now() - startTime < channel.timeout) {
                await asyncSleep(100)
                continue
            }
            throw new ServiceWorkerError(url, response.status)
        }
    }

    /**
     * Call this in the browser's main UI thread
     * to send a message to the worker reading from the channel with `readMessage`.
     *
     * @param channel a non-null object returned by `makeChannel`, `makeAtomicsChannel`, or `makeServiceWorkerChannel`.
     * @param message any object that can be safely passed to `JSON.stringify` and then decoded with `JSON.parse`.
     * @param messageId a unique string identifying the message that the worker is waiting for.
     *                  Currently only used by service worker channels.
     */
    async function writeMessage(channel, message, messageId) {
        if (channel.type === "atomics") {
            writeMessageAtomics(channel, message)
        } else {
            await writeMessageServiceWorker(channel, message, messageId)
        }
    }

    /**
     * Accepts one optional argument `options` with optional keys for configuring the different types of channel.
     * See the types `AtomicsChannelOptions` and `ServiceWorkerChannelOptions` for more info.
     *
     * If `SharedArrayBuffer` is available, `makeChannel` will use it to create an `atomics` type channel.
     * Otherwise, if `navigator.serviceWorker` is available, it will create a `serviceWorker` type channel,
     * but registering the service worker is up to you.
     * If that's not available either, it'll return `null`.
     *
     * Channel objects have a `type` property which is either `"atomics"` or `"serviceWorker"`.
     * The other properties are for internal use.
     *
     * If you want to control the type of channel,
     * you can call `makeAtomicsChannel` or `makeServiceWorkerChannel` directly.
     *
     * A single channel object shouldn't be used by multiple workers simultaneously,
     * i.e. you should only read/write one message at a time.
     */
    function makeChannel(options = {}) {
        if (typeof SharedArrayBuffer !== "undefined") {
            return makeAtomicsChannel(options.atomics)
        } else if ("serviceWorker" in navigator) {
            return makeServiceWorkerChannel(options.serviceWorker)
        } else {
            return null
        }
    }

    function makeAtomicsChannel({
        bufferSize
    } = {}) {
        const data = new Uint8Array(new SharedArrayBuffer(bufferSize || 128 * 1024))
        const meta = new Int32Array(
            new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2)
        )
        return {
            type: "atomics",
            data,
            meta
        }
    }

    function makeServiceWorkerChannel(options = {}) {
        const baseUrl = (options.scope || "/") + BASE_URL_SUFFIX
        return {
            type: "serviceWorker",
            baseUrl,
            timeout: options.timeout || 5000
        }
    }

    function ensurePositiveNumber(n, defaultValue) {
        return n > 0 ? +n : defaultValue
    }

    /**
     * Call this in a web worker to synchronously receive a message sent by the main thread with `writeMessage`.
     *
     * @param channel a non-null object returned by `makeChannel`, `makeAtomicsChannel`, or `makeServiceWorkerChannel`.
     *                Should be created once in the main thread and then sent to the worker.
     * @param messageId a unique string identifying the message that the worker is waiting for.
     *                  Currently only used by service worker channels.
     *                  Typically created in the worker using the `uuidv4` function and then sent to the main thread
     *                  *before* calling `readMessage`.
     * @param checkInterrupt a function which may be called regularly while `readMessage`
     *                       is checking for messages on the channel.
     *                       If it returns `true`, then `readMessage` will return `null`.
     * @param timeout a number of milliseconds.
     *                If this much time elapses without receiving a message, `readMessage` will return `null`.
     */
    function readMessage(
        channel,
        messageId, {
            checkInterrupt,
            checkTimeout,
            timeout
        } = {}
    ) {
        const startTime = performance.now()

        checkTimeout = ensurePositiveNumber(checkTimeout, checkInterrupt ? 100 : 5000)
        const totalTimeout = ensurePositiveNumber(timeout, Number.POSITIVE_INFINITY)
        let check

        if (channel.type === "atomics") {
            const {
                data,
                meta
            } = channel

            check = () => {
                if (Atomics.wait(meta, 1, 0, checkTimeout) === "timed-out") {
                    return null
                } else {
                    const size = Atomics.exchange(meta, 0, 0)
                    const bytes = data.slice(0, size)
                    Atomics.store(meta, 1, 0)

                    const decoder = new TextDecoder()
                    const text = decoder.decode(bytes)
                    return JSON.parse(text)
                }
            }
        } else {
            check = () => {
                const request = new XMLHttpRequest()
                // `false` makes the request synchronous
                const url = channel.baseUrl + "/read"
                request.open("POST", url, false)
                const requestBody = {
                    messageId,
                    timeout: checkTimeout
                }
                request.send(JSON.stringify(requestBody))
                const {
                    status
                } = request

                if (status === 408) {
                    return null
                } else if (status === 200) {
                    const response = JSON.parse(request.responseText)
                    if (response.version !== VERSION) {
                        return null
                    }
                    return response.message
                } else if (performance.now() - startTime < channel.timeout) {
                    return null
                } else {
                    throw new ServiceWorkerError(url, status)
                }
            }
        }

        while (true) {
            const elapsed = performance.now() - startTime
            const remaining = totalTimeout - elapsed
            if (remaining <= 0) {
                return null
            }

            checkTimeout = Math.min(checkTimeout, remaining)
            const result = check()

            if (result !== null) {
                return result
            } else if (checkInterrupt?.()) {
                return null
            }
        }
    }

    /**
     * Synchronously waits until the given time has elapsed without wasting CPU in a busy loop,
     * but not very accurate.
     */
    function syncSleep(ms, channel) {
        ms = ensurePositiveNumber(ms, 0)
        if (!ms) {
            return
        }

        if (typeof SharedArrayBuffer !== "undefined") {
            const arr = new Int32Array(
                new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT)
            )
            arr[0] = 0
            Atomics.wait(arr, 0, 0, ms)
        } else {
            const messageId = `sleep ${ms} ${uuidv4()}`
            readMessage(channel, messageId, {
                timeout: ms
            })
        }
    }

    /**
     * Returns a unique random string in UUID v4 format.
     * Uses `crypto.randomUUID` directly if possible.
     * Otherwise uses a custom implementation which uses `crypto.getRandomValues`.
     */
    let uuidv4

    if ("randomUUID" in crypto) {
        uuidv4 = function uuidv4() {
            return crypto.randomUUID()
        }
    } else {
        // https://stackoverflow.com/a/2117523/2482744
        uuidv4 = function uuidv4() {
            return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, char => {
                const c = Number(char)
                return (
                    c ^
                    (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
                ).toString(16)
            })
        }
    }

    self.syncMessage = {
        isServiceWorkerRequest,
        serviceWorkerFetchListener,
        asyncSleep,
        ServiceWorkerError,
        writeMessageAtomics,
        writeMessageServiceWorker,
        writeMessage,
        makeChannel,
        makeAtomicsChannel,
        makeServiceWorkerChannel,
        readMessage,
        syncSleep,
        uuidv4
    };
}