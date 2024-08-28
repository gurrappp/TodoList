const uri = '/todoitems';
let todos = [];

function getItems() {
    fetch(uri)
        .then(response => response.json())
        .then(data => _displayItems(data))
        .catch(error => console.error('Unable to get items', error));
}

function _displayItems(data) {
    const tBody = document.getElementById('todos');
    tBody.innerHTML = '';

    _displayCount(data.length);

    const button = document.createElement('button');

    data.forEach(item => {
        let isCompleteCheckbox = document.createElement('input');
        isCompleteCheckbox.type = 'checkbox';
        isCompleteCheckbox.disabled = true;
        isCompleteCheckbox.checked = item.isComplete;

        let editButton = button.cloneNode(false);
        editButton.innerText = 'Edit';
        editButton.setAttribute('onclick', `displayEditForm(${item.id})`);

        let deleteButton = button.cloneNode(false);
        deleteButton.innerText = 'Delete';
        //deleteButton.setAttribute('onclick', `deleteItem(${item.id})`);
        deleteButton.setAttribute('onclick', `displayDeleteForm(${item.id})`);

        let tr = tBody.insertRow();

        let td1 = tr.insertCell(0);
        td1.appendChild(isCompleteCheckbox);

        let td2 = tr.insertCell(1);
        let textNode = document.createTextNode(item.name);
        td2.appendChild(textNode);

        let td3 = tr.insertCell(2);
        td3.appendChild(editButton);

        let td4 = tr.insertCell(3);
        td4.appendChild(deleteButton);
    });

    todos = data;
}

function _displayCount(itemCount) {
    const name = (itemCount == 1) ? 'to-do' : 'to-dos';

    document.getElementById('counter').innerText = `${itemCount} ${name}`;
}

function addItem() {

    const addNameTextBox = document.getElementById('add-name');

    const item = {
        isComplete: false,
        name: addNameTextBox.value.trim()
    };

    fetch(uri, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify(item)
    })
        .then(response => response.json())
        .then(() => {
            getItems();
            addNameTextBox.value = '';
        })
        .catch(error => console.error('Unable to add item', error));

}

function displayEditForm(id) {

    closeInput();
    const item = todos.find(item => item.id === id);

    document.getElementById('edit-name').value = item.name;
    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-isComplete').checked = item.isComplete;
    document.getElementById('editForm').style.display = 'block';
}

function displayDeleteForm(id) {

    closeInput();
    const item = todos.find(item => item.id === id);

    document.getElementById('delete-name-label').innerHTML = item.name;
    document.getElementById('delete-id').value = item.id;
    document.getElementById('confirmDeleteForm').style.display = 'block';

}

function updateItem() {

    const itemId = document.getElementById('edit-id').value;
    const item = {
        id: parseInt(itemId, 10),
        isComplete: document.getElementById('edit-isComplete').checked,
        name: document.getElementById('edit-name').value.trim()
    };

    fetch(`${uri}/${itemId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    })
        .then(() => getItems())
        .then(result => {
            if (result.status === 200) {
                displaySuccess();
            }
        })
        .catch(error => console.error('Unable to update item', error));

    closeInput();

    return false;
}

function displaySuccess() {
    console.log("here");
}

function closeInput() {
    document.getElementById('editForm').style.display = 'none';
    document.getElementById('confirmDeleteForm').style.display = 'none';
    document.getElementById('editSuccessForm').style.display = 'none';
}

function deleteItem() {

    const itemId = document.getElementById('delete-id').value;
    fetch(`${uri}/${itemId}`, {
        method: 'DELETE'
    })
        .then(() => getItems())
        .catch(error => console.error('Unable to delete item', error));

    closeInput();

    return false;
}