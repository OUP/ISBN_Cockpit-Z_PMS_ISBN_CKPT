sap.ui.define(
  [
    "./BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
  ],
  function (BaseController, MessageToast, MessageBox, JSONModel, formatter) {
    "use strict";

    // smart table
    let _oView = null;
    let _oTable = null;
    let _oViewModel = new JSONModel({ edit: false });

    return BaseController.extend("oup.pms.zpmsisbnckpt.controller.Worklist", {
      formatter: formatter,

      /* =========================================================== */
      /* lifecycle methods                                           */
      /* =========================================================== */

      /**
       * Called when the worklist controller is instantiated.
       * @public
       */
      onInit: function () {
        _oView = this.getView();
        _oTable = _oView.byId("list-table-id").getTable();

        // view model
        this.setModel(_oViewModel, "oViewModel");

        // table initialization
        this._tableInit();
      },

      /* =========================================================== */
      /* event handlers                                              */
      /* =========================================================== */

      /**
       * Event handler when a table item gets pressed
       * @param {sap.ui.base.Event} oEvent the button press event
       * @public
       */
      onNavPress: function (oEvent) {
        try {
          // validate row selection
          const oData = this._validateTableRowSelection();

          if (!oData) {
            throw "error";
          }

          var oSource = oEvent.getSource();
          var sTarget = oSource.data("target");
          var oTarget = {};
          var oParams = {};

          switch (sTarget) {
            case "ImpressionDetails":
              // target
              oTarget.semanticObject = "ZImprDetail";
              oTarget.action = "manage";

              // params
              oParams.matnr = oData.matnr;
              oParams.pspid = oData.pspid;
              oParams.ean11 = oData.ean11;
              oParams.prart = oData.prart;
              oParams.posid = oData.Impression;
              break;

            default:
              break;
          }

          this._navToTarget(oTarget, oParams);
        } catch (error) {}
      },

      /**
       * Event handler when a table item gets pressed
       * @param {sap.ui.base.Event} oEvent the table selectionChange event
       * @public
       */
      onPress: function (oEvent) {
        // The source is the list item that got pressed
        this._showObject(oEvent.getSource());
      },

      onSavePress: async function (_oEvent) {
        try {
          // start busy indicator
          sap.ui.core.BusyIndicator.show(0);

          // const oSource = oEvent.getSource();
          // const sTarget = oSource.data("target");

          if (!_oView.getModel().hasPendingChanges()) {
            // display warning message
            MessageBox.information("There are no changes found to save", {
              styleClass: "sapUiSizeCompact",
            });

            throw "no changes found";
          }

          await this._saveChanges();

          // toggle edit property in view model
          _oViewModel.setProperty("/edit", false);
        } catch (error) {
          // failed to save changes

          // end busy indicator
          sap.ui.core.BusyIndicator.hide();
        }
      },

      onEditPress: () => _oViewModel.setProperty("/edit", true),

      onCancelPress: () => {
        if (_oView.getModel().hasPendingChanges()) {
          // display warning message
          MessageBox.warning("Cancel your changes ?", {
            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
            emphasizedAction: MessageBox.Action.OK,
            styleClass: "sapUiSizeCompact",
            onClose: (sAction) => {
              if (sAction === MessageBox.Action.OK) {
                // cancel the changes by resetting the model
                _oView.getModel().resetChanges();

                // toggle edit property in view model
                _oViewModel.setProperty("/edit", false);
              }
            },
          });
        } else {
          // toggle edit property in view model
          _oViewModel.setProperty("/edit", false);
        }
      },

      /* =========================================================== */
      /* internal methods                                            */
      /* =========================================================== */

      /**
       * Shows the selected item on the object page
       * On phones a additional history entry is created
       * @param {sap.m.ObjectListItem} oItem selected Item
       * @private
       */
      _showObject: function (oItem) {
        this.getRouter().navTo("object", {
          objectId: oItem.getBindingContext().getProperty("Impression"),
        });
      },

      _tableInit: () => {
        // add event delegate for onafter rendering
        _oTable.addEventDelegate({
          onAfterRendering: (oContext) => {
            try {
              const oSmartTable = oContext.srcControl;
              const aColumns = oSmartTable.getColumns();

              for (const oColumn of aColumns) {
                const sProperty = oColumn.getFilterProperty();
                let sWidth = "8em";

                if (sProperty === "Impression") {
                  sWidth = "12em";
                } else if (sProperty === "post1") {
                  sWidth = "25em";
                } else if (sProperty === "name_org1") {
                  sWidth = "18em";
                } else if (sProperty === "frgco") {
                  sWidth = "12em";
                }
                oColumn.setWidth(sWidth);
              }
            } catch (error) {}
          },
        });
      },

      _validateTableRowSelection: () => {
        try {
          const iSelectedIndex = _oTable.getSelectedIndex();

          if (iSelectedIndex === -1) {
            throw "error";
          }

          // get selected row from biniding context
          const oContext = _oTable.getContextByIndex(iSelectedIndex);
          const oData = oContext.getObject() || null;

          return oData;
        } catch (error) {
          MessageToast.show(
            this.getResourceBundle().getText("worlistNoRowSelected")
          );
        }
      },

      _navToTarget: (oTarget, oParams) =>
        sap.ushell.Container.getService(
          "CrossApplicationNavigation"
        ).toExternal({
          target: {
            semanticObject: oTarget.semanticObject,
            action: oTarget.action,
          },
          params: oParams,
        }),

      _saveChanges: () =>
        new Promise((reslove, reject) => {
          const fnSuccess = (oDataResponse) => {
            try {
              // check for odata response status code
              const bError =
                oDataResponse.__batchResponses[0].response.statusCode !== "200";
              if (bError) {
                throw "error";
              }

              // if no errors, resolve the promise
              reslove(oDataResponse);
            } catch (error) {
              // error in odata request
              reject("Failed to save the changes");
            }
          };

          const fnError = (oErrorResponse) => {
            reject(oErrorResponse);
          };

          _oView.getModel().submitChanges({
            success: fnSuccess,
            error: fnError,
          });
        }),
    });
  }
);
