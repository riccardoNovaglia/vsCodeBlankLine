import VSCodeAdapter from '../src/VSCodeAdapter'

export default class DocumentStubBuilder {
    private stubVSAdapter;

    private uri = 'any/path';
    private blankLine = true;
    private lineCount = 123;

    constructor(stubVSAdapter) {
        this.stubVSAdapter = stubVSAdapter;
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
        this.stubVSAdapter.docURI = () => { return this.uri };
        this.stubVSAdapter.lastDocumentLineIsEmpty = () => { return this.blankLine };
        this.stubVSAdapter.docLineCount = () => { return this.lineCount };
    }
}
