sap.ui.define([
    "demo/manageproducts/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
], function (Controller, JSONModel, Sorter, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("demo.manageproducts.controller.List", {
        
        onInit: function () {
            this.getRouter().getRoute("List").attachMatched(this._onRouteMatched, this);
            var oModel = new JSONModel({
                deleteEnabled: false,
                busy: false
            });
            this.setModel(oModel, "viewModel");            
        },

        //登録ボタンを押したとき
        onAdd: function () {
            this.getRouter().navTo("Detail", {});
        },       
        
        onDelete: function () {
            MessageBox.confirm("Delete selected product(s)?", {
				actions: ["Delete", MessageBox.Action.CLOSE],
				emphasizedAction: "Delete",                
                onClose: this._deleteItems.bind(this)
            });            
        },

        //行選択したとき
        onDetailPress: function (oEvent) {
            var id = oEvent.getSource().getBindingContext().getProperty("id");
            this.getRouter().navTo("Detail", {
                id: id
            });
        },        

        onSelectionChange: function (oEvent) {
            var aContexts = oEvent.getSource().getSelectedContexts();
            if (aContexts.length > 0) {
                this.setProperty("viewModel", "deleteEnabled", true);
            } else {
                this.setProperty("viewModel", "deleteEnabled", false);
            }
        },

        _onRouteMatched: function () {
            this._doRefresh()
        }, 
        
        _doRefresh: function () {
            this.setProperty("viewModel", "busy", true);
            //バックエンドからデータを取得   
            this.sendXMLHttpRequest('GET', '/node-pg/products')
            .then((response)=> {
                //JSONモデルを作成してビューにセット
                var products = JSON.parse(response)
                this.getView().setModel(new JSONModel(products))
                //idでソート
                var oSorter = new Sorter("id")
                oSorter.fnCompare = function(value1, value2) {
                    if (value1 < value2) return -1;
                    if (value1 == value2) return 0;
                    if (value1 > value2) return 1;                    
                }
                this.byId("table").getBinding("items").sort(oSorter)
                this.setProperty("viewModel", "busy", false);   
            })
            .catch(error => {
                this.handleError(error)
            })
        },
        
        _deleteItems: function (oAction) {
            if (oAction === MessageBox.Action.CLOSE) { 
                return
            }
            var oTable = this.byId("table")
            var aContexts = oTable.getSelectedContexts()
            this.setProperty("viewModel", "busy", true); 
            var aDeletePromises = aContexts.map(oContext => {
                var id = oContext.getProperty("id")
                return this.sendXMLHttpRequest('DELETE', `/node-pg/products/${id}`)
            })

            Promise.all(aDeletePromises)
            .then(() => {
                this._doRefresh();
                MessageToast.show('Selected product(s) have been deleted');                      
            })
            .catch(error => {
                this.handleError(error)
            });                                       
        }
    });
});
