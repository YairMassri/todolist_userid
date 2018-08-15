window.onload = function () {
    const todosContainer = document.getElementById('todos-container');
    const newtodo = document.getElementById('new-todo-input');
    const addBtn = document.getElementById('add-todo-btn');
    const form = document.getElementById('formtodo');
    const input = form.querySelector('input');
    const mainDiv = document.querySelector('.container');
    const ul = document.getElementById('todosList');

    const div = document.createElement('div');
    const filterLabel = document.createElement('label');
    const filterCheckBox = document.createElement('input');

    filterLabel.textContent = "Hide those you have already done";
    filterCheckBox.type = "checkbox";
    div.appendChild(filterLabel);
    div.appendChild(filterCheckBox);
    mainDiv.insertBefore(div, ul);

    filterCheckBox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        const lis = ul.children;
        if (isChecked) {
            for (let i = 0; i < lis.length; i += 1) {
                let li = lis[i];
                let input = li.childNodes[1].childNodes[1];
                console.log(input);
                
                if (input.checked) {
                    console.log("filter1");
                    li.style.display = 'none';
                } else {
                    console.log("filter2");
                    li.style.display = '';
                }
            }
        } else {
            for (let i = 0; i < lis.length; i += 1) {
                let li = lis[i];
                console.log("filter3");
                li.style.display = '';
            }
        }
    });

    addBtn.onclick = function (e) {
        console.log('add todo');
        if (newtodo.value) {
            fetch('/create-todo', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: "include",
                body: JSON.stringify({
                    text: newtodo.value,
                })
            })
                .then(response => response.json())
                .then(response => {
                    console.log(response)
                    if (response.affectedRows) {
                        const li = insertTodo({
                            id: response.insertId,
                            text: newtodo.value,
                            complete: false,
                            created: response.created,
                        });

                        newtodo.value = '';
                        ul.appendChild(li);
                    }
                })
                .catch(error => console.error(error));
        } else {
            alert('No value inside the input...')

        }
    }

    fetch('/get-todos')
        .then(response => response.json())
        .then(response => {
            console.log(response)

            response.forEach(todo => {

                insertTodo(todo);

            });
        });

    function insertTodo(todo) {
        let li = document.createElement('li');
        li.id = todo.id;
        li['data-complete'] = todo.complete;

        const span = document.createElement('span');
        span.textContent = todo.text;

        let date = document.createElement('span');
        if (todo.complete > 0) {
            var t = todo.donedatetime.split(/[T]/);
            var d = t[0].split(/[-]/);
            var a = t[1].split(/[:]/);
            var z = a[2].split(/[.]/);
            var f = d[0] + "-" + d[1] + "-" + d[2];
            var x = a[0];
            var h = x + ":" + a[1] + ":" + z[0];
            date.textContent = f + ' ' + ' ' +h;
        } else {
            date.textContent = '';
        }


        const label = document.createElement('label');
        label.textContent = 'Confirmed';

        const editButton = document.createElement('button');
        editButton.textContent = 'edit';
        editButton.onclick = function (e) {
            fetch('/edit-todo', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: "include",
                body: JSON.stringify({
                    id: todo.id,
                    text: li.firstElementChild.value
                })
            })
                .then(response => response.json())
                .then(response => {

                    const button = e.target;
                    const li = button.parentNode;
                    const ul = li.parentNode;

                    if (button.textContent === 'edit') {
                        const span = li.firstElementChild;
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.value = span.textContent;
                        li.insertBefore(input, span);
                        li.removeChild(span);
                        button.textContent = 'save';
                    } else if (button.textContent === 'save') {
                        const input = li.firstElementChild;
                        const span = document.createElement('span');
                        span.textContent = input.value;
                        li.insertBefore(span, input);
                        li.removeChild(input);
                        button.textContent = 'edit';
                    }

                })
                .catch(error => console.error(error));
        }

        let newtodo = document.getElementById('new-todo-input');
        newtodo.type = "input";

        let addBtn = document.getElementById('add-todo-btn');

        let checkbox = document.createElement('input');
        // let date = document.createElement('input');
        // date.value = '';
        checkbox.type = "checkbox";
        checkbox.id = "checkbox-" + todo.id;
        checkbox.checked = todo.complete;
        checkbox.onchange = function (e) {
            fetch('/update-todo', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: "include",
                body: JSON.stringify({
                    id: todo.id,
                    complete: checkbox.checked,
                })
            })
                .then(response => response.json())
                .then(response => {

                    const listItem = checkbox.parentNode.parentNode;
                    if (checkbox.checked) {
                        listItem.className = 'checked';
                        date.textContent = response.donedatetime;

                    } else {
                        listItem.className = '';
                        date.textContent = '';
                    }

                })
                .catch(error => console.error(error));
            console.log('check box ' + todo.id + ' click');
            console.log(checkbox.checked);
        }

        let removeBtn = document.createElement('button');
        removeBtn.id = "removeBtn-" + todo.id;
        removeBtn.classList.add('removeBtn');
        removeBtn.textContent = 'remove';
        removeBtn.onclick = function (e) {
            fetch('/delete-todo', {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: "include",
                body: JSON.stringify({ id: todo.id })
            })
                .then(response => response.json())
                .then(response => {
                    console.log("it worked!", response)
                    if (response.affectedRows > 0) {
                        li.remove();
                    }
                })
                .catch(error => console.error(error));

            console.log('remove ' + todo.id + ' click');
        }


        label.appendChild(checkbox);
        label.appendChild(date);
        li.appendChild(span);
        li.appendChild(label);
        li.appendChild(editButton);
        li.appendChild(removeBtn);



        ul.appendChild(li);
        todosContainer.appendChild(ul);

    }
}
