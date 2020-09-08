class UserController{

    constructor(formIdCreate, tableId, boxIdCreate, boxIdUpdate){

        this.formEl = document.getElementById(formIdCreate);   
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

    }

    onSubmit(){

        this.formEl.addEventListener("submit", event => {

            event.preventDefault();

            let btnSubmit = this.formEl.querySelector('[type=submit]');

            btnSubmit.disable = true;

            let values = this.getValues();

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

    getValues(){

        let user = {};
        let isValid = true;
        
        [...this.formEl.elements].forEach((field, index) => {

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
    
            tr.innerHTML = 
                    `                  
                        <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
                        <td>${dataUser.name}</td>
                        <td>${dataUser.email}</td>
                        <td>${(dataUser.admin?"sim":"não")}</td>
                        <td>${Utils.dateFormat(dataUser.register)}</td>
                        <td>
                            <button type="button" class="btn btn-edit btn-primary btn-xs btn-flat">Editar</button>
                            <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
                        </td>
                    `;

                    tr.querySelector('.btn-edit').addEventListener("click", e=>{

                        //console.log(JSON.parse(tr.dataset.user));

                        this.showHiddenForm();

                    });
    
                    this.tableEl.appendChild(tr);

                    this.updateCount();
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