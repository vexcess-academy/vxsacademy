class secrets {
    static final bool USE_PROXY = false;
    static final String MASTER_KEY = "PASSWORD1";
    static final String RECAPTCHA_KEY = "PASSWORD2";
    static final String? KEY_PATH = "./secrets/server.key";
    static final String? CERT_PATH = "./secrets/server.cert";
    static final int PORT = 3000;
    static final int SANDBOX_PORT = 3001;
    static final int COMPILER_PORT = 3002;
    static final int MONGO_PORT = 27017;
    static final String MONGO_IP = "localhost";
    static final String? MONGO_PASSWORD = null;
}
