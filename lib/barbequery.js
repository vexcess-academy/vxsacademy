/**

    Barbequery - a lightweight easy to use DOM library
    All code written by Vexcess available under the MIT license (https://opensource.org/license/mit/)

    TODO:
        - implement logical query operators
        - implement server side rendering???
**/

(() => {
    class BElement {
        constructor(el) {
            this.el = el;
        }
    
        prependTo(a) {
            (a.el ?? a).prepend(this.el);
            return this;
        }
        
        appendTo(a) {
            (a.el ?? a).append(this.el);
            return this;
        }
        
        addClass(...args) {
            this.el.classList.add(...args);
            return this;
        }
        
        removeClass(...args) {
            this.el.classList.remove(...args);
            return this;
        }
        
        setId(a) {
            this.el.id = a;
            return this;
        }
        
        html(a) {
            if (a === undefined) return this.el.innerHTML;
            this.el.innerHTML = a;
            return this;
        }
        
        text(a) {
            if (this.el.value) {
                if (a === undefined) return this.el.value;
                this.el.value = a;
            } else {
                if (a === undefined) return this.el.textContent;
                this.el.textContent = a;
            }
            return this;
        }
    
        replaceChild(a, b) {
            this.el.replaceChild(a.el ?? a, b.el ?? b);
            return this;
        }
    
        removeChild(a) {
            this.el.removeChild(a.el ?? a);
            return this;
        }
        
        on(a, b, c) {
            this.el.addEventListener(a, b, c);
            return this;
        }
        
        css(c) {
            if (typeof c === "string") {
                let pairs = c.split(";"), colonIdx, key, val;
                for (var i = 0; i < pairs.length; i++) {
                    colonIdx = pairs[i].indexOf(":");
                    key = pairs[i].slice(0, colonIdx).trim();
                    if (key.length > 0) {
                        val = pairs[i].slice(colonIdx + 1).trim();
                        this.el.style[key] = val;
                    }
                }
            } else {
                for (let p in c) {
                    this.el.style[p] = c[p];
                }
            }
            return this;
        }
        
        attr(a, b) {
            if (typeof a === "object") {
                for (let p in a) {
                    this.el[p] = a[p];
                }
            } else {
                this.el[a] = b;
            }
            return this;
        }
    
        prepend(...args) {
            for (var i = 0; i < args.length; i++) {
                args[i] = args[i].el ?? args[i];
            }
            this.el.prepend(...args);
            return this;
        }
        
        append(...args) {
            for (var i = 0; i < args.length; i++) {
                args[i] = args[i].el ?? args[i];
            }
            this.el.append(...args);
            return this;
        }
    
        $(a, b) {
            return B(a, b, this.el);
        }
    
        get parentEl() {
            return B(this.el.parentElement);
        }
    
        insertBefore(newEl, refEl) {
            this.el.insertBefore(newEl.el ?? newEl, refEl.el ?? refEl);
            return this;
        }
    }

    const EL_PROPS = {
        props: "value,textContent,nodeValue,autoPictureInPicture,disablePictureInPicture,kind,srclang,label,default,dateTime,wrap,placeholder,readOnly,required,rows,autofocus,cols,defaultValue,maxLength,minLength,caption,tHead,tFoot,span,rowSpan,scope,col,colgroup,row,rowgroup,colSpan,abbr,media,sizes,srcset,size,selectedIndex,length,multiple,name,type,async,defer,noModule,cite,selected,defaultSelected,userMap,data,reversed,start,height,low,max,min,optimum,charset,content,httpEquiv,href,hreflang,rel,as,htmlFor,patterns,selectionEnd,selectionStart,selectionDirection,alt,accept,files,webkitdirectory,webkitEntries,checked,defaultChecked,indeterminate,disabled,formAction,formEnctype,formMethod,formNoValidate,formTarget,step,valueAsDate,valueAsNumber,dirName,inputmode,useMap,decoding,isMap,loading,crossOrigin,referrerPolicy,sandbox,srcdoc,allow,method,action,encoding,enctype,acceptCharset,autocomplete,noValidate,validationMessage,validity,willValidate,returnValue,open,width,tabIndex,volume,src,srcObject,preload,preservesPitch,playbackRate,loop,muted,currentTime,defaultMuted,defaultPlaybackRate,disableRemotePlayback,controls,audioTracts,autoplay,coords,host,hostname,target,username,search,protocol,port,pathname,password,hash,download,accessKey,contentEditable,dir,draggable,enterKeyHint,hidden,inert,innerText,inputMode,popover,lang,nonce,outerText,spellcheck,style,title,translate,className,id,innerHTML,outerHTML,part,scrollLeft,scrollTop,slot".split(","),
        read_props: "previousSibling,parentElement,parentNode,ownerDocument,nodeType,nodeName,nextSibling,lastChild,isConnected,firstChild,childNodes,baseURI,videoHeight,videoWidth,readyState,track,textLength,cells,rowIndex,sectionRowIndex,tBodies,headers,cellIndex,sheet,selectedOptions,options,position,index,areas,relList,control,form,labels,list,x,y,naturalHeight,naturalWidth,currentSrc,complete,contentDocument,contentWindow,elements,validateMessage,textTracks,videoTracks,seekable,seeking,played,networkState,paused,duration,ended,error,mediaKeys,controlsList,buffered,reList,origin,accessKeyLabel,attributeStyleMap,isContentEditable,dataset,offsetHeight,offsetLeft,offsetParent,offsetTop,offsetWidth,assignedSlot,attributes,childElementCount,children,classList,clientHeight,clientLeft,clientTop,clientWidth,firstElementChild,lastElementChild,localName,namespaceURI,nextElementSibling,prefix,previousElementSibling,scrollHeight,scrollWidth,shadowRoot,tagName".split(","),
        methods: "normalize,lookupNamespaceURI,lookupPrefix,isSameNode,isEqualNode,isDefaultNamespace,hasChildNodes,getRootNode,contains,compareDocumentPosition,cloneNode,appendChild,getVideoPlaybackQuality,requestPictureInPicture,setRangeText,setSelectionRange,checkValidity,setCustomValidity,deleteRow,insertRow,deleteCell,insertCell,createTHead,deleteTHead,createTFoot,deleteTFoot,createTBody,createCaption,deleteCaption,assign,assignedNodes,assignedElements,item,namedItem,remove,blur,click,focus,select,showPicker,reportValidity,stepDown,stepUp,decode,requestSubmit,reset,submit,close,show,showModal,captureStream,getContext,toDateURL,toBlob,transferControlToOffscreen,addTextTrack,canPlayType,faskSeek,load,pause,play,setMediaKeys,setSinkId,toString,attachInternals,hidePopover,showPopover,togglePopover,after,attachShadow,animate,before,closest,computedStyleMap,dispatchEvent,getAnimations,getAttribute,getAttributeNames,getAttributeNode,getAttributeNodeNS,getAttributeNS,getBoundingClientRect,getClientRects,getElementsByClassName,getElementsByTagName,getElementsByTagNameNS,hasAttribute,hasAttributeNS,hasAttributes,hasPointerCapture,insertAdjacentElement,insertAdjacentHTML,insertAdjacentText,matches,querySelector,querySelectorAll,releasePointerCapture,removeAttribute,removeAttributeNode,removeAttributeNS,removeEventListener,replaceChildren,replaceWith,requestFullscreen,requestPointerLock,scroll,scrollBy,scrollIntoView,scrollTo,setAttribute,setAttributeNode,setAttributeNodeNS,setAttributeNS,setPointerCapture,toggleAttribute".split(",")
    };

    let obj = {};
    for (let name of EL_PROPS.props) {
        obj[name] = {
            get() {
                return this.el[name];
            },
            set(val) {
                this.el[name] = val;
            }
        };
    }
    for (let name of EL_PROPS.read_props) {
        obj[name] = {
            get() {
                return this.el[name];
            }
        };
    }
    for (let name of EL_PROPS.methods) {
        obj[name] = {
            get() {
                return this.el[name].bind(this.el);
            }
        };
    }
    Object.defineProperties(BElement.prototype, obj);
    
    function B(a, b, c) {
        // convert Element to BElement
        if (a instanceof Element) return new BElement(a);

        // if already a BElement simply return it
        if (a instanceof BElement) a;

        // Selection queries/create Element
        let selectors = a.split(">");
        for (var i = 0; i < selectors.length; i++) {
            let select = selectors[i].trim();
            let param = select.slice(1);
            switch (select.charAt(0)) {
                // id selector
                case "#":
                    if (typeof c === "object" && c.length) {
                        let newEl = [];
                        for (let i = 0; i < c.length; i++) {
                            newEl.push(c.getElementById(param));
                        }
                        c = newEl;
                    } else {
                        c = (c ?? document).getElementById(param);
                    }
                break;

                // class selector
                case ".":
                    if (typeof c === "object" && c.length) {
                        let newEl = [];
                        for (let i = 0; i < c.length; i++) {
                            let res = c[i].getElementsByClassName(param);
                            for (let j = 0; j < res.length; j++) {
                                newEl.push(res[j]);
                            }
                        }
                        c = newEl;
                    } else {
                        c = (c ?? document).getElementsByClassName(param);
                    }
                break;

                // element selector
                case "*":
                    if (typeof c === "object" && c.length) {
                        let newEl = [];
                        for (let i = 0; i < c.length; i++) {
                            let res = c[i].getElementsByTagName(param);
                            for (let j = 0; j < res.length; j++) {
                                newEl.push(res[j]);
                            }
                        }
                        c = newEl;
                    } else {
                        c = (c ?? document).getElementsByTagName(param);
                    }
                break;

                default:
                    let components = B.components;
                    // does the component exist?   
                    if (components[select]) {
                        c = document.createElement("template");
                        let componentCode = components[select].template;
        
                        // set id and class if given
                        if (b && (b.id || b.class)) {
                            let openTagIdx = B.noStringIdxOf(componentCode, "<");
                            let spaceIdx = openTagIdx + componentCode.slice(openTagIdx).indexOf(" ");
                            if (b.id) {
                                componentCode = componentCode.slice(0, spaceIdx) + ` id="${b.id}"` + componentCode.slice(spaceIdx);
                            }
                            if (b.class) {
                                if (componentCode.includes("class=")) {
                                    let classIdx = B.noStringIdxOf(componentCode, "class=") + 7;
                                    componentCode = componentCode.slice(0, classIdx) + `${b.class} ` + componentCode.slice(classIdx);
                                } else {
                                    componentCode = componentCode.slice(0, spaceIdx) + ` class="${b.class}"` + componentCode.slice(spaceIdx);
                                }
                            }
                        }
                        
                        let code = B.template(componentCode, b, "\\");
                        
                        for (let compName in components) {
                            // find index of component in parent component code
                            let compIdx = B.noStringIdxOf(code, "<" + compName);
                            while (compIdx > -1) {
                                // if there is a component, find the end of its opening tag
                                let j = B.noStringIdxOf(code, ">", compIdx);
                                // get content of component opening tag
                                let inputData = code.slice(compIdx, j);
                                inputData = inputData.slice(inputData.indexOf(" "));
                                
                                // split content into key values pairs
                                let chunks = inputData.split("=");
                                let pairs = Array((chunks.length - 1) * 2);
                                let pairsIdx = 0;
                                pairs[pairsIdx++] = chunks[0].trim();
                                for (var i = 1; i < chunks.length - 1; i++) {
                                    let str = chunks[i];
                                    let k = str.length - 2;
                                    while (k > 0) {
                                        if (str[k] === '"' || str[k] === "'") {
                                            pairs[pairsIdx++] = str.slice(0, k+1).trim();
                                            pairs[pairsIdx++] = str.slice(k+1).trim();
                                            break;
                                        }
                                        k--;
                                    }
                                }
                                pairs[pairsIdx++] = chunks[chunks.length - 1].trim();

                                // create object from key value pairs
                                let inputObj = {};
                                for (var i = 0; i < pairs.length; i += 2) {
                                    inputObj[pairs[i]] = pairs[i+1].slice(1, pairs[i+1].length - 1);
                                }

                                // get html of sub component
                                let templ = B("template");
                                templ.content.append(B(compName, inputObj).el);
                                
                                // I forgot how this works, but it does
                                code =  code.slice(0, compIdx) + 
                                        templ.innerHTML +
                                        code.slice(j + 1);
                                compIdx = B.noStringIdxOf(code, "<" + compName);
                            }
                        }

                        // the element
                        c.innerHTML = code;
                        c = c.content.children[0];

                        // run callback
                        if (components[select].callback) {
                            components[select].callback.bind(new BElement(c))(b, c);
                        }
                    } else {
                        c = document.createElement(select);
                    }
                break;
            }
        }

        // wrap output
        if (c instanceof Element) {
            c = new BElement(c);
        } else if (c === null || c === undefined) {
            return null;
        } else {
            let i, arr = new Array(c.length);
            for (i = c.length - 1; i >= 0; i--) {
                arr[i] = new BElement(c[i]);
            }
            c = arr;
        }
        
        return c;
    }

    B.BElement = BElement;

    B.html = String.raw;

    B.noStringIdxOf = (str, targetStr, start) => {
        let i = start || 0, inString = false, strType = "", strTypes = ['"', "'", "`"];
        while (i < str.length) {
            let c = str.charAt(i);
            if (strTypes.includes(c)) {
                if (inString) {
                    if (c === strType) {
                        inString = false;
                    }
                } else {
                    inString = true;
                    strType = c;
                }
            }
            if (str.slice(i, i + targetStr.length) === targetStr && !inString) {
                return i;
            }
            i++;
        }
        return -1;
    }
    
    B.template = (str, obj, specialChar) => {
        let newStr = "";
        let i = 0;
        let escapeChar = specialChar ?? "$";
        let currChar;
        while (i < str.length) {
            currChar = str.charAt(i);
            if (currChar === escapeChar && str.charAt(i + 1) === "{") {
                let props = "";
                i += 2;
                while (str.charAt(i) !== "}" && i < str.length) {
                    props += str.charAt(i);
                    i++;
                }
                props = props.split(".");
                let val = obj;
                for (var n = 0; n < props.length; n++) {
                    val = val?.[props[n]];
                }
                if (typeof val === "string") {
                    val = val
                    .replaceAll("&", "&amp;")
                    .replaceAll("<", "&lt;")
                    .replaceAll(">", "&gt;")
                    .replaceAll('"', "&quot;")
                    .replaceAll("'", "&#39;");
                }
                newStr += val;
            } else {
                newStr += currChar;
            }
            i++;
        }
        return newStr;
    }
    
    B.getJSON = async (url, callback) => {
        let res = await fetch(url);
        let json;
        try {
            json = await res.json();
        } catch (err) {
            json = null;
        }
    
        if (callback !== undefined) {
            callback(json);
        }
        return json;
    };
    
    B.getJSONP = (url, callback) => {
        let callbackId = Math.random().toString().replace(".", "");
        let script = document.createElement("script");
        B.getJSON["c" + callbackId] = function (json) {
            script.remove();
            callback(json);
        };
        script.src = url + (url.match(/\?/) ? "&" : "?") + "callback=$.getJSON.c" + callbackId;
        document.body.append(script);
    };
    
    B.components = {};
    
    B.createComponent = (name, code, callback) => {
        B.components[name] = {
            template: code.trim(),
            callback: callback
        };
        return options => B(name, options);
    };
    
    B.deleteComponent = (...args) => {
        for (var i = 0; i < args.length; i++) {
            delete B.components[args[i]];
        }
    };
    
    window.$ = B;
    
})();