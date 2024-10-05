import { BaseExtension } from './BaseExtension.js';

class ShareExtension extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this._shareButton = null;
    }
    onToolbarCreated() {
        this._shareButton = this.createToolbarButton('model-share-button', 'https://static-00.iconduck.com/assets.00/share-icon-2048x1911-60w04qpe.png', 'Share this model');
        this._shareButton.onClick = () => {

            const url = window.location.href;

            // Use the Clipboard API to copy the URL to the clipboard
            navigator.clipboard.writeText(url)
                .then(() => {
                    alert('Link copied to clipboard' );
                })
                .catch(err => {
                    console.error('Failed to copy the text: ', err);
                });
        }
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('ShareExtension', ShareExtension);