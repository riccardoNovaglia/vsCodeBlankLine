import VSCodeAdapter from '../src/VSCodeAdapter'

export default class DocumentStubBuilder {
    private sandbox;

    private uri = 'any/path';
    private blankLine = true;
    private lineCount = 123;

    constructor(sandbox) {
        this.sandbox = sandbox;
    }

    public withUri(uri) {
        this.uri = uri;
        return this;
    }

    public withoutBlankLine() {
        this.blankLine = false;
        return this;
    }

    public withLineCount(count) {
        this.lineCount = count;
        return this;
    }

    public build() {
        this.sandbox.stub(VSCodeAdapter.prototype, 'docURI').returns(this.uri);
        this.sandbox.stub(VSCodeAdapter.prototype, 'lastDocumentLineIsEmpty').returns(this.blankLine);
        this.sandbox.stub(VSCodeAdapter.prototype, 'docLineCount').returns(this.lineCount);
    }
}
