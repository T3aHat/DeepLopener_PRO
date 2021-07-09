# Why do I need to log in and enable synchronization?

To securely store your API_KEY. When you enable synchronization, `chrome.identity.getProfileUserInfo()` will get the information of the Google account you are signed in to. This information is used to obfuscate the API_KEY and store it by using `chrome.storage.sync.set()`, but this extension **does not** intentionally send this information to the any server. See the [implementation](https://github.com/T3aHat/DeepLopener/blob/main/options.js) for details. If you don't understand the behavior of this code, please don't use this extension, as stated in the [disclaimer](https://github.com/T3aHat/DeepLopener#%E5%85%8D%E8%B2%AC%E4%BA%8B%E9%A0%85disclaimer). If you don't want to log in to Chrome or sync, there is an another [version](https://github.com/T3aHat/DeepLopener/tree/main/DeepLopener_no_sync) that asks for a password every time you translate for the first time after launching chrome instead of synchronization (but deprecated).  
We are not satisfied with this implementation. We think that this problem is the most important that needs to be solved ASAP. If you have any good ideas, please contact us via [issue](https://github.com/T3aHat/DeepLopener/issues). It is possible that this problem will be fixed in the future.

- 開発者はド素人なので，特に API 鍵の保存方法に関するアドバイスを[issue](https://github.com/T3aHat/DeepLopener/issues)から頂けると幸いです．