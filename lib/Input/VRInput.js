import Input from "./Input.js"

export default class VRInput extends Input {
    constructor() {
        super();
        
        document.addEventListener('vrEvent', (button) => {
            console.log(button.detail.session);
        });
    }
}