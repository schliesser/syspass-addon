const gettingStoredSettings = browser.storage.local.get();
let url = token = password = '';
let usernameField = '', passwordField = '';

/**
 * Get addon settings
 */
gettingStoredSettings.then(function (data) {
    url = data.url;
    token = data.token;
    password = data.password;

    searchAccounts().then(function (data) {
        selectLogin(data);
    });
});

/**
 * Search accounts according to given URL
 *
 * @returns {Promise<any>}
 */
function searchAccounts() {
    return fetch(url + '/api.php', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "jsonrpc": "2.0",
            "method": "account/search",
            "params": {
                "authToken": token,
                "text": window.location.host
            },
            "id": 1
        })
    }).then((resp) => resp.json())
        .then(function(data) {
            return data
        })
        .catch(function(e) {
            console.log(e);
        });
}

/**
 *
 *
 * @param id
 * @returns {Promise<any>}
 */
function getAccount(id) {
    return fetch(url + '/api.php', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "jsonrpc": "2.0",
            "method": "account/viewPass",
            "params": {
                "authToken": token,
                "tokenPass": password,
                "id": 2,
                "details": false,
            },
            "id": 1
        })
    }).then((resp) => resp.json())
        .then(function(data) {
            passwordField.value = data.result.result.password;
            return data
        })
        .catch(function(e) {
            console.log(e);
        });
}

/**
 * Create dropdown
 */
class Dropdown {
    constructor(input, json) {
        this.input = input;
        this.json = json;
        this.id = Math.random().toString(36).substr(2, 9);
        this.list();
    }

    get data() {
        return this.json;
    }

    get field() {
        return this.input;
    }

    list() {
        const result = this.json.result.result;
        const width = this.field.getBoundingClientRect().width;
        let list = document.createElement('ul');

        list.className = 'myDropdown';
        list.id = this.id;
        list.style.cssText = "position: absolute; width: " + width + "px; background: #dedede; z-index: 100; padding: 5px 10px; border: 1px solid #000"

        console.log(this.json.result);

        if(this.json.result.count > 0) {
            result.forEach(element => {
                let item = this.createItem(element);
                list.append(item);
            });

            this.input.after(list);
        }
    }

    createItem(element) {
        let item = document.createElement('li');
        item.innerText = element.name + ' (' + element.clientName + '/' + element.categoryName + ')';
        item.style.cssText = "padding: 6px; list-style: none;"
        item.className = 'syspass-account'

        item.addEventListener("click", function () {
            usernameField.value = element.login;
            getAccount(element.id);
        });

        return item;
    }

    destroy() {
        document.getElementById(this.id).remove();
    }
}

function initField(field, data) {
    let dropdown = false;

    field.addEventListener("focus", function () {
        dropdown = new Dropdown(field, data);
    });

    field.addEventListener("focusout", function () {
        setTimeout(function () {
            dropdown.destroy();
        }, 200);
    });
}

function selectLogin(data) {
    setTimeout(function() {
        usernameField = document.querySelector('input[name="session[username_or_email]"]')
            || document.querySelector('input[name=username]')
            || document.querySelector('input[name=user]')
            || document.querySelector('input[name="user[login]"]')
            || document.querySelector('input[name="email"]')
            || document.querySelector('input[name="e-mail"]')
            || document.querySelector('input[name="login"]');
        passwordField = document.querySelector('input[type=password]');

        initField(usernameField, data);
        initField(passwordField, data);
    }, 100);
}
