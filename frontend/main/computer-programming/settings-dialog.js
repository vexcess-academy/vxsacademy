$.createComponent("settings-dialog", $.html`
    <div id="editor-settings">
        <h1>Settings</h1>
        
        <p></p>

        <div style="float: left;">
            <h3>Width</h3>
            <input id="canvasWidth" type="number" value="">
        </div>

        <div style="float: right; width: 375px;">
            <h3>Height</h3>
            <input id="canvasHeight" type="number" value="">
        </div>

        <br><br><br><br><br>
            
        <h3>Indent Width</h3>
        <select id="indentSize">
          <option value="2">2 spaces</option>
          <option value="4">4 spaces</option>
        </select>
        
        <h3>Theme</h3>
        <select id="editorTheme">
          <option value="vs-dark">Dark Mode</option>
          <option value="vs">Light Mode</option>
        </select>
        
        <h3>Font Size</h3>
        <select id="fontSize">
            <option value="10">10px</option>
            <option value="12">12px</option>
            <option value="13">13px</option>
            <option value="14">14px</option>
            <option value="16">16px</option>
        </select>
        
        <p></p>
        
        <button class="button">Cancel</button>
        <button class="button">Save and Close</button>
    </div>
`)

class SettingsDialog {
    editor;
    div;

    widthEl;
    heightEl;
    indentSizeEl;
    themeEl;
    fontSizeEl;

    constructor(editor) {
        const self = this; 

        this.editor = editor;
        this.div = $("settings-dialog");
        const placeholder =  $("#settings-placeholder");
        placeholder.parentElement.replaceChild(this.div.el, placeholder.el);

        // find settings elements
        this.widthEl =  $("#canvasWidth");
        this.heightEl = $("#canvasHeight");
        this.indentSizeEl = $("#indentSize");
        this.themeEl = $("#editorTheme");
        this.fontSizeEl = $("#fontSize");

        // initialize the settings values
        const settings = this.editor.settings;
        this.widthEl.value = settings.width;
        this.heightEl.value = settings.height;
        this.indentSizeEl.value = settings.indentSize;
        this.themeEl.value = settings.theme;
        this.fontSizeEl.value = settings.fontSize;

        const [ cancelBtn, saveBtn ] = this.div.$(".button");

        cancelBtn.on("click", () => {
            $("#page-darken").style.display = "none";
            self.div.style.display = "none";
        
            self.widthEl.value = settings.width;
            self.heightEl.value = settings.height;
            self.indentSizeEl.value = settings.indentSize;
            self.themeEl.value = settings.theme;
            self.fontSizeEl.value = settings.fontSize;
        });
        
        // save and close button
        saveBtn.on("click", () => {
            $("#page-darken").style.display = "none";
            self.div.style.display = "none";

            // coerce canvas dimensions to be integers
            self.widthEl.value = self.widthEl.value | 0;
            self.heightEl.value = self.heightEl.value | 0;
        
            settings.width = parseInt(self.widthEl.value, 10);
            settings.height = parseInt(self.heightEl.value, 10);
            settings.indentSize = parseInt(self.indentSizeEl.value, 10);
            settings.theme = self.themeEl.value;
            settings.fontSize = parseInt(self.fontSizeEl.value, 10);
        
            self.editor.monacoEditor.getModel().updateOptions({
                tabSize: settings.indentSize,
                fontSize: settings.fontSize + "px",
            });
        
            self.editor.updateStyles();
            self.editor.updateSize();
            self.editor.runProgram();
        });
    }

    show() {
        $("#page-darken").style.display = "block";
        this.div.style.display = "block";
    }
}
