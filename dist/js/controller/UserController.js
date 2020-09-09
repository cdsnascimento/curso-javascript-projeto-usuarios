class UserController{

    constructor(formIdCreate, formIdUpdate, tableId, boxIdCreate, boxIdUpdate){

        this.formEl = document.getElementById(formIdCreate); 
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.boxCreate = document.getElementById(boxIdCreate);
        this.boxUpdate = document.getElementById(boxIdUpdate);

        this.onSubmit();
        this.onEditCancel();

        this.selectAll();

    }

    onEditCancel(){

        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{

            this.showHiddenForm();

        });

        this.boxUpdate.addEventListener("submit", event => {

            event.preventDefault();

            let btnEditSubmit = this.formUpdateEl.querySelector("[type=submit]");

            btnEditSubmit.disable = true;

            let values = this.getValues(this.formUpdateEl);

            let indexEdit = this.formUpdateEl.dataset.trIndex;

            let trIndex = this.tableEl.rows[indexEdit];

            let userOld = JSON.parse(trIndex.dataset.user);
            
            let result = Object.assign({},userOld,values)

            

            this.getPhoto(this.formUpdateEl).then(
                (content) => {

                    if(!values.photo) {
                        result._photo = userOld._photo;
                    } else {
                        result._photo = content;                                   
                    }

                    trIndex.dataset.user = JSON.stringify(result);

                    trIndex.innerHTML = this.innerHtmlUser(result);

                    this.addEventsTr(trIndex);

                    this.updateCount();

                    this.formUpdateEl.reset();

                    btnEditSubmit.disable = false;

                    this.showHiddenForm();
                },
                (e) => {

                    console.error(e);

                }
            
            );

        });

    }

    innerHtmlUser(data) {

        return  `                  
                    <td><img src="${data._photo}" alt="User Image" class="img-circle img-sm"></td>
                    <td>${data._name}</td>
                    <td>${data._email}</td>
                    <td>${(data._admin?"sim":"não")}</td>
                    <td>${Utils.dateFormat(data._register)}</td>
                    <td>
                        <button type="button" class="btn btn-edit btn-primary btn-xs btn-flat">Editar</button>
                        <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
                    </td>
                `;


    }

    onSubmit(){

        this.formEl.addEventListener("submit", event => {

            event.preventDefault();

            let btnSubmit = this.formEl.querySelector('[type=submit]');

            btnSubmit.disable = true;

            let values = this.getValues(this.formEl);

            if (!values) return false;

            this.getPhoto(this.formEl).then(
                (content) => {

                    values.photo = content;

                    this.insertUser(values);

                    this.addLine(values);

                    this.formEl.reset();
                    
                    btnSubmit.disable = false;
                },
                (e) => {

                    console.error(e);

                }
            
            );

        });

    }

    getPhoto(form){

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...form.elements].filter(item => {
    
                if (item.name === 'photo') {
    
                    return item;
    
                }
    
            });
    
            let file = elements[0].files[0];
    
            fileReader.onload = () => {
    
                resolve(fileReader.result);
    
            };
    
            fileReader.onerror = (e) => {

                reject(e);

            };

            if(file){

                fileReader.readAsDataURL(file);

            } else {

                resolve('dist/img/boxed-bg.jpg');

            }
            

        });

    }

    getValues(formEl){

        let user = {};
        let isValid = true;
        
        [...formEl.elements].forEach((field, index) => {

            if(['name','email','password'].indexOf(field.name) > -1 && !field.value){

                field.parentElement.classList.add('has-error');
                isValid = false;

            }

            if (field.name == "gender") {
        
                if (field.checked) {
        
                    user[field.name] = field.value;
        
                }
        
            } else if (field.name == 'admin') {
                
                user[field.name] = field.checked;

            } else{
        
                user[field.name] = field.value;
        
            }
        
        });

        if (!isValid){

            return false;

        }
    
        return new User(
                        user.name,
                        user.gender,
                        user.birth,
                        user.country,
                        user.email,
                        user.password,
                        user.photo,
                        user.admin
        );
    
    }


    getUsersStorage(){

        let users = [];

        if(localStorage.getItem("users")) {

            users = JSON.parse(localStorage.getItem("users"));

        }
        
        /*  SESSION STORAGE
        if(sessionStorage.getItem("users")) {

            users = JSON.parse(sessionStorage.getItem("users"));

        }
        */
        return users;

    }

    selectAll(){

        let users = this.getUsersStorage();

        users.forEach(dataUser => {

            let user = new User();

            user.loadFromJSON(dataUser);

            this.addLine(user);

        });

    }

    insertUser(dataUser){

        let users = this.getUsersStorage();

        users.push(dataUser);

        sessionStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("users", JSON.stringify(users));

    }

    addLine(dataUser){
    
        let tr = document.createElement("tr");

        

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = this.innerHtmlUser(dataUser);

        this.addEventsTr(tr);

        this.tableEl.appendChild(tr);

        this.updateCount();
    }

    addEventsTr(tr){

        tr.querySelector(".btn-delete").addEventListener("click", e => {

            if(confirm("Deseja relamente excluir?")){

                tr.remove();
                this.updateCount();

            }

        });

        tr.querySelector('.btn-edit').addEventListener("click", e=>{

            let json = JSON.parse(tr.dataset.user);

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            for (let name in json){

                let fieldBoxUpdate = this.formUpdateEl.querySelector("[name=" + name.replace("_","") + "]");

                if (fieldBoxUpdate){

                    switch (fieldBoxUpdate.type) {

                        case 'file':
                            continue;
                            break;
                        case 'radio':
                            fieldBoxUpdate = this.boxUpdate.querySelector("[name=" + name.replace("_","") + "][value=" + json[name] + "]");
                            fieldBoxUpdate.checked = true;
                            break;
                        case 'checkbox':
                            fieldBoxUpdate.checked = json[name];
                            break;
                        default:
                            fieldBoxUpdate.value =json[name];

                    }
                    
                }
                   
            }

            this.formUpdateEl.querySelector(".photo").src = json._photo;

            this.showHiddenForm();

        });

    }

    showHiddenForm(){


        if (this.boxUpdate.style.display == "none"){

            this.boxUpdate.style.display = "block";
            this.boxCreate.style.display = "none";

        } else {
            
            this.boxCreate.style.display = "block";
            this.boxUpdate.style.display = "none";
            
        }
        
    }

    updateCount(){

        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr => {

            numberUsers++;
            
            let user = JSON.parse(tr.dataset.user);

            if(user._admin) numberAdmin++;
            

        });

        document.getElementById('number-users').innerHTML = numberUsers;
        document.getElementById('number-admin').innerHTML = numberAdmin;

    }

}