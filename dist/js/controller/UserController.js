class UserController{

    constructor(formIdCreate, formIdUpdate, tableId, boxIdCreate, boxIdUpdate){

        this.formEl = document.getElementById(formIdCreate); 
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.boxCreate = document.getElementById(boxIdCreate);
        this.boxUpdate = document.getElementById(boxIdUpdate);

        this.onSubmit();
        this.onEditCancel();

    }

    onEditCancel(){

        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{

            this.showHiddenForm();

        });

        this.boxUpdate.addEventListener("submit", event => {

            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]");

            btn.disable = true;

            let values = this.getValues(this.formUpdateEl);

            let indexEdit = this.boxUpdate.dataset.trIndex;

            let trIndex = this.tableEl.rows[indexEdit];
            
            trIndex.dataset.user = JSON.stringify(values);

            trIndex.innerHTML = this.innerHtmlUser(values);

            this.addEventsTr(trIndex);

            this.updateCount();

            this.formUpdateEl.reset();

            this.showHiddenForm();

        });

    }

    innerHtmlUser(data) {

        return  `                  
                    <td><img src="${data.photo}" alt="User Image" class="img-circle img-sm"></td>
                    <td>${data.name}</td>
                    <td>${data.email}</td>
                    <td>${(data.admin?"sim":"não")}</td>
                    <td>${Utils.dateFormat(data.register)}</td>
                    <td>
                        <button type="button" class="btn btn-edit btn-primary btn-xs btn-flat">Editar</button>
                        <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
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

            this.getPhoto().then(
                (content) => {

                    values.photo = content;

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

    getPhoto(){

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...this.formEl.elements].filter(item => {
    
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

    addLine(dataUser){
    
        let tr = document.createElement("tr");

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = this.innerHtmlUser(dataUser);

        this.addEventsTr(tr);

        this.tableEl.appendChild(tr);

        this.updateCount();
    }

    addEventsTr(tr){

        tr.querySelector('.btn-edit').addEventListener("click", e=>{

            let json = JSON.parse(tr.dataset.user);

            this.boxUpdate.dataset.trIndex = tr.sectionRowIndex;

            for (let name in json){

                let fieldBoxUpdate = this.boxUpdate.querySelector("[name=" + name.replace("_","") + "]");

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