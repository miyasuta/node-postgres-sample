sap.ui.define([
    "demo/manageproducts/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("demo.manageproducts.controller.Detail", {
        onInit: function () {
            this.getRouter().getRoute("Detail").attachMatched(this._onRouteMatched, this);

            var oModel = new JSONModel({
                isStatusVisible: false,
                deleteEnabled: false,
                editable: false,
                busy: false
            });
            this.setModel(oModel, "viewModel");
        },

        onEdit: function () {
            this._setEditable(true)
        },

        onSave: function () {
            var oProduct = this.getModel().getData()
            var id = oProduct.id
            var url = id ? `/node-pg/products/${id}`: '/node-pg/products'
            var method = id ? 'PUT': 'POST'
            this.setProperty("viewModel", "busy", true); 
            this.sendXMLHttpRequest(method, url, oProduct)
            .then((response)=> {
                var newId = JSON.parse(response).id
                MessageToast.show(`Product ${newId} has been created/updated`, {
                    closeOnBrowserNavigation: false
                })
                this.setProperty("viewModel", "busy", false); 
                var oRouter = this.getRouter();
                oRouter.navTo("List");  
            })
            .catch(error => {
                this.handleError(error)
            })  
        },

        onDelete: function () {
            MessageBox.confirm("Delete this product?", {
				actions: ["Delete", MessageBox.Action.CLOSE],
				emphasizedAction: "Delete",                
                onClose: this._deleteItem.bind(this)
            }); 
        },
        
        onNavButtonPress: function () {
            this.onNavBack()
        },        

        _deleteItem: function (oAction) {
            if (oAction === MessageBox.Action.CLOSE) { 
                return
            }            
            var id = this.getView().getBindingContext().getProperty("id")      
            this.setProperty("viewModel", "busy", true); 
            this.sendXMLHttpRequest('DELETE', `/node-pg/products/${id}`)
            .then(()=> {
                MessageToast.show(`Product ${id} has been deleted`, {
                    closeOnBrowserNavigation: false
                })
                this.setProperty("viewModel", "busy", false); 
                var oRouter = this.getRouter();
                oRouter.navTo("List");  
            })
            .catch(error => {
                this.handleError(error)
            })             
        },

        _onRouteMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var id = oArgs.id;
            //create
            if (id === undefined) {
                this._handleCreate();
            //edit or display
            } else {
                this._handleDisplay(id);
            }                 
        },
        
        _handleCreate: function () {
            var oProduct = new JSONModel({
                name: "",
                price: 0
            })
            this.getView().setModel(oProduct)
            this.getView().bindObject("/")  
            this._setEditable(true)
        },

        _handleDisplay: function (id) {
            this.setProperty("viewModel", "busy", true); 
            //バックエンドからデータを取得
            this.sendXMLHttpRequest('GET', `/node-pg/products/${id}`)
            .then((response)=> {
                //JSONモデルを作成してビューにセット
                var product = JSON.parse(response)
                this.getView().setModel(new JSONModel(product))
                this.getView().bindObject("/")
                this._setEditable(false)
                this.setProperty("viewModel", "busy", false); 
            })
            .catch(error => {
                this.handleError(error)
            })          
        },

        _setEditable(bEditable) {
            this.setProperty("viewModel", "editable", bEditable);
        },        

    });
});
