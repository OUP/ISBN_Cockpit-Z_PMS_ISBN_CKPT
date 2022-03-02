sap.ui.define(
  [
    "./BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "../model/formatter",
  ],
  function (
    BaseController,
    MessageToast,
    MessageBox,
    JSONModel,
    Fragment,
    formatter
  ) {
    "use strict";

    // smart table
    let _oView = null;
    let _oTable = null;
    let _oThis = null;
    let _oViewModel = new JSONModel({ edit: false });
    let _oPreqTextDialog = null;
    let _oScheduleTextDialog = null;
    let _oRowSelected = null;

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
        _oThis = this;

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
          _oRowSelected = this._validateTableRowSelection();

          if (!_oRowSelected) {
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
              oParams.matnr = _oRowSelected.matnr;
              oParams.pspid = _oRowSelected.pspid;
              oParams.ean11 = _oRowSelected.ean11;
              oParams.prart = _oRowSelected.prart;
              oParams.posid = _oRowSelected.Impression;
              break;

            case "Component":
              // target
              oTarget.semanticObject = "ZComponentParentsBlock";
              oTarget.action = "manage";

              // params
              oParams.compack = "Component";
              oParams.Impression = _oRowSelected.Impression;
              break;

            case "ParentsPacks":
              // target
              oTarget.semanticObject = "ZComponentParentsBlock";
              oTarget.action = "manage";

              // params
              oParams.compack = "Packs";
              oParams.Impression = _oRowSelected.Impression;
              break;

            case "RFQCreate":
              // target
              oTarget.semanticObject = "PurchaseRequisition";
              oTarget.action = "manage";

              // check for banfn value
              if (!_oRowSelected.banfn) {
                throw "No Purchase Requisition Exits for this Impression";
              }

              // params
              oParams.PurchaseRequisition = _oRowSelected.banfn;
              break;

            case "RFQUpdate":
              // target
              oTarget.semanticObject = "RequestForQuotation";
              oTarget.action = "manage";

              // check for rfq_num value
              if (!_oRowSelected.rfq_num) {
                throw "NO RFQ Exists for this Impression";
              }

              // params
              oParams.RequestForQuotation = _oRowSelected.rfq_num;
              break;

            case "ZPST":
              // target
              oTarget.semanticObject = "ZPSR";
              oTarget.action = "manage";

              // params
              oParams.Product = _oRowSelected.matnr;
              oParams.Plant = _oRowSelected.werks;
              oParams.sorg = _oRowSelected.vkorg;
              oParams.distChanl = _oRowSelected.vtweg;
              break;

            default:
              break;
          }

          // if there are no target properties skip the navigation
          if (Object.keys(oTarget).length === 0) {
            return;
          }

          this._navToTarget(oTarget, oParams);
        } catch (error) {
          MessageToast.show(error);
        }
      },

      onBeforeExport: function (oEvent) {
        var mExcelSettings = oEvent.getParameter("exportSettings");

        // ISBN
        const oMatnr = {
          columnId: "container-z_pms_isbn_ckpt---worklist--list-table-id-matnr",
          displayUnit: false,
          falseValue: undefined,
          inputFormat: null,
          label: "ISBN",
          precision: undefined,
          property: "matnr",
          scale: undefined,
          template: null,
          textAlign: "Begin",
          trueValue: undefined,
          type: "string",
          unitProperty: undefined,
          width: 20,
        };
        mExcelSettings.workbook.columns.splice(2, 0, oMatnr);

        // User status
        const oUserStatus = {
          columnId:
            "container-z_pms_isbn_ckpt---worklist--list-table-id-usrstat_code",
          displayUnit: false,
          falseValue: undefined,
          inputFormat: null,
          label: "User Status",
          precision: undefined,
          property: ["usrstat_code", "usrstat_code_Text"],
          scale: undefined,
          template: "{1} ({0})",
          textAlign: "Begin",
          trueValue: undefined,
          type: "string",
          unitProperty: undefined,
          width: 12,
        };
        mExcelSettings.workbook.columns.splice(3, 0, oUserStatus);

        // Impression Owner
        const oVernr = {
          columnId: "container-z_pms_isbn_ckpt---worklist--list-table-id-vernr",
          displayUnit: false,
          falseValue: undefined,
          inputFormat: null,
          label: "Impression Owner",
          precision: undefined,
          property: ["vernr", "vernr_Text"],
          scale: undefined,
          template: "{1} ({0})",
          textAlign: "Begin",
          trueValue: undefined,
          type: "string",
          unitProperty: undefined,
          width: 12,
        };
        mExcelSettings.workbook.columns.splice(4, 0, oVernr);

        // Purchase Requisition
        const oBanfn = {
          columnId: "container-z_pms_isbn_ckpt---worklist--list-table-id-banfn",
          displayUnit: false,
          falseValue: undefined,
          inputFormat: null,
          label: "Purchase Requisition",
          precision: undefined,
          property: "banfn",
          scale: undefined,
          template: null,
          textAlign: "Begin",
          trueValue: undefined,
          type: "string",
          unitProperty: undefined,
          width: 12,
        };
        mExcelSettings.workbook.columns.splice(6, 0, oBanfn);

        // Purchasing Document
        const oPoNum = {
          columnId:
            "container-z_pms_isbn_ckpt---worklist--list-table-id-po_num",
          displayUnit: false,
          falseValue: undefined,
          inputFormat: null,
          label: "Purchasing Document",
          precision: undefined,
          property: "po_num",
          scale: undefined,
          template: null,
          textAlign: "Begin",
          trueValue: undefined,
          type: "string",
          unitProperty: undefined,
          width: 12,
        };
        mExcelSettings.workbook.columns.splice(11, 0, oPoNum);

        // MCO Number
        const oMcoNum = {
          columnId:
            "container-z_pms_isbn_ckpt---worklist--list-table-id-mco_num",
          displayUnit: false,
          falseValue: undefined,
          inputFormat: null,
          label: "MCO Number",
          precision: undefined,
          property: "mco_num",
          scale: undefined,
          template: null,
          textAlign: "Begin",
          trueValue: undefined,
          type: "string",
          unitProperty: undefined,
          width: 12,
        };
        mExcelSettings.workbook.columns.splice(12, 0, oMcoNum);

        // RFQ Number
        const oRfqNum = {
          columnId:
            "container-z_pms_isbn_ckpt---worklist--list-table-id-rfq_num",
          displayUnit: false,
          falseValue: undefined,
          inputFormat: null,
          label: "RFQ Number",
          precision: undefined,
          property: "rfq_num",
          scale: undefined,
          template: null,
          textAlign: "Begin",
          trueValue: undefined,
          type: "string",
          unitProperty: undefined,
          width: 12,
        };
        mExcelSettings.workbook.columns.splice(13, 0, oRfqNum);

        // Bulk Deal
        const oBulkDeal = {
          columnId:
            "container-z_pms_isbn_ckpt---worklist--list-table-id-bulk_deal",
          displayUnit: false,
          falseValue: undefined,
          inputFormat: null,
          label: "Bulk Deal",
          precision: undefined,
          property: ["bulk_deal", "bulk_deal_Text"],
          scale: undefined,
          template: "{1} ({0})",
          textAlign: "Begin",
          trueValue: undefined,
          type: "string",
          unitProperty: undefined,
          width: 12,
        };
        mExcelSettings.workbook.columns.splice(14, 0, oBulkDeal);

        // Rag Status
        const oRagStatus = {
          columnId:
            "container-z_pms_isbn_ckpt---worklist--list-table-id-zz_rag_status",
          displayUnit: false,
          falseValue: undefined,
          inputFormat: null,
          label: "RAG Status",
          precision: undefined,
          property: ["zz_rag_status", "rag_status_txt"],
          scale: undefined,
          template: "{1} ({0})",
          textAlign: "Begin",
          trueValue: undefined,
          type: "string",
          unitProperty: undefined,
          width: 12,
        };
        mExcelSettings.workbook.columns.splice(18, 0, oRagStatus);
      },

      onSavePress: async function (_oEvent) {
        try {
          if (!_oView.getModel().hasPendingChanges()) {
            // display warning message
            MessageBox.information("There are no changes found to save", {
              styleClass: "sapUiSizeCompact",
            });

            throw "No changes found";
          }

          await this._saveChanges();

          // toggle edit property in view model
          _oViewModel.setProperty("/edit", false);

          // success message
          MessageToast.show("Saved Successfully");
        } catch (error) {
          // failed to save changes
          MessageBox.error(error, {
            styleClass: _oThis.getOwnerComponent().getContentDensityClass(),
          });
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

      onPreqTextPress: async function () {
        try {
          // validate row selection
          _oRowSelected = this._validateTableRowSelection();

          // check for banfn value
          if (!_oRowSelected.banfn) {
            throw "No Purchase Requisition Exits for this Impression";
          }

          if (!_oPreqTextDialog) {
            // initialize dialog
            _oPreqTextDialog = await this._loadFragment(
              `oup.pms.zpmsisbnckpt.view.fragment.PreqText`,
              this
            );

            // add view dependent
            _oView.addDependent(_oPreqTextDialog);
          }

          const dataRequested = () => _oPreqTextDialog.setBusy(true);
          const dataReceived = () => _oPreqTextDialog.setBusy(false);

          // preq text model
          _oPreqTextDialog.setModel(_oView.getModel());

          // bind element for the dialog
          _oPreqTextDialog.bindElement({
            path: `/ZPMSPREQTEXTSet(Posid='${_oRowSelected.Impression}',Banfn='${_oRowSelected.banfn}')`,
            events: {
              dataRequested,
              dataReceived,
            },
          });

          // open dialog
          _oPreqTextDialog.open();
        } catch (error) {
          MessageToast.show(error);
        }
      },

      onPreqTextDialogCancel: () => _oPreqTextDialog.close(),

      onPreqTextDialogSave: () => {
        const fnSuccess = (_) => {
          MessageToast.show("Saved Successfully !");
          _oPreqTextDialog.close();
        };

        const fnError = (_) => {
          MessageToast.show(`Error - ${_}`);
        };

        _oView.getModel().submitChanges({
          success: fnSuccess,
          error: fnError,
        });
      },

      onNextImpressionCreationPress: async function () {
        try {
          // validate row selection
          _oRowSelected = this._validateTableRowSelection();

          // check for banfn value
          if (!_oRowSelected.Impression) {
            throw "No Impression found!";
          }

          const fnSuccess = (_) => {
            MessageToast.show("Next Impression Created Successfully");

            // end busy indicator
            sap.ui.core.BusyIndicator.hide();
          };

          const fnError = (_) => {
            // end busy indicator
            sap.ui.core.BusyIndicator.hide();

            try {
              let sMessage = JSON.parse(_.responseText).error.message.value;

              // failed to save changes
              MessageBox.error(sMessage, {
                styleClass: _oThis.getOwnerComponent().getContentDensityClass(),
              });
            } catch (error) {
              // no handler
            }
          };

          // start busy indicator
          sap.ui.core.BusyIndicator.show(0);

          const oPayload = {
            Posid: _oRowSelected.Impression,
            Psphi: _oRowSelected.psphi,
            Matnr: _oRowSelected.matnr,
          };

          _oView.getModel().create("/ZPMSNEXTIMPRSet", oPayload, {
            success: fnSuccess,
            error: fnError,
          });
        } catch (error) {
          // end busy indicator
          sap.ui.core.BusyIndicator.hide();
        }
      },

      onMaterialPress: function (oEvent) {
        const oRowObject = oEvent.getSource().getBindingContext().getObject();
        const Product = oRowObject.matnr;

        // target
        const oTarget = {
          semanticObject: "Material",
          action: "manage",
        };

        // params
        const oParams = {
          Product,
        };

        this._navToTarget(oTarget, oParams);
      },

      onPurchaseRequestionPress: function (oEvent) {
        const oRowObject = oEvent.getSource().getBindingContext().getObject();
        const PurchaseRequisition = oRowObject.banfn;

        // target
        const oTarget = {
          semanticObject: "PurchaseRequisition",
          action: "manage",
        };

        // params
        const oParams = {
          PurchaseRequisition,
        };

        this._navToTarget(oTarget, oParams);
      },

      onPurchaseOrderPress: function (oEvent) {
        const oRowObject = oEvent.getSource().getBindingContext().getObject();
        const PurchaseOrder = oRowObject.po_num;

        // target
        const oTarget = {
          semanticObject: "PurchaseOrder",
          action: "manage",
        };

        // params
        const oParams = {
          PurchaseOrder,
        };

        this._navToTarget(oTarget, oParams);
      },

      onPurchaseContractPress: function (oEvent) {
        const oRowObject = oEvent.getSource().getBindingContext().getObject();
        const PurchaseContract = oRowObject.mco_num;

        // target
        const oTarget = {
          semanticObject: "PurchaseContract",
          action: "manage",
        };

        // params
        const oParams = {
          PurchaseContract,
        };

        this._navToTarget(oTarget, oParams);
      },

      onRequestForQuotationPress: function (oEvent) {
        const oRowObject = oEvent.getSource().getBindingContext().getObject();
        const RequestForQuotation = oRowObject.rfq_num;

        // target
        const oTarget = {
          semanticObject: "RequestForQuotation",
          action: "manage",
        };

        // params
        const oParams = {
          RequestForQuotation,
        };

        this._navToTarget(oTarget, oParams);
      },

      onNavToActivitiesPress: function (oEvent) {
        try {
          const oRow = oEvent.getParameter("row");
          const oContext = oRow.getBindingContext();
          const oData = oContext.getObject() || null;

          // target
          const oTarget = {
            semanticObject: "ZWBSActivity",
            action: "manage",
          };

          // params
          const posid = oData.Impression || "";
          const oParams = {
            posid,
          };

          // navigation
          this._navToTarget(oTarget, oParams);
        } catch (error) {}
      },

      /* =========================================================== */
      /* internal methods                                            */
      /* =========================================================== */

      _loadFragment: (sPath, _oThis) =>
        new Promise((reslove, reject) =>
          Fragment.load({
            name: sPath,
            controller: _oThis,
          })
            .then((oFragment) => reslove(oFragment))
            .catch((oError) => reject(oError))
        ),

      _tableInit: () => {
        // add event delegate for onafter rendering
        const _onSmartTableBusyStateChanged = (oEvent) => {
          const bBusy = oEvent.getParameter("busy");
          if (!bBusy) {
            let oTpc = null;
            if (sap.ui.table.TablePointerExtension) {
              oTpc = new sap.ui.table.TablePointerExtension(_oTable);
            } else {
              oTpc = new sap.ui.table.extensions.Pointer(_oTable);
            }
            const aColumns = _oTable.getColumns();
            for (let i = aColumns.length; i >= 0; i--) {
              oTpc.doAutoResizeColumn(i);
            }
          }
        };

        // add event delegate for onafter rendering
        _oTable.addEventDelegate({
          onAfterRendering: (_) =>
            _oTable.attachBusyStateChanged(_onSmartTableBusyStateChanged),
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
            _oThis.getResourceBundle().getText("worlistNoRowSelected")
          );
        }
      },

      _navToTarget: (oTarget, oParams) => {
        var sParams = "";
        for (const property in oParams) {
          sParams += `${property}=${oParams[property]}&`;
        }

        if (sParams.length > 0) {
          // remove trailing '&'
          sParams = sParams.substr(0, sParams.length - 1);
        }

        // launch the application in new tab
        sap.m.URLHelper.redirect(
          `#${oTarget.semanticObject}-${oTarget.action}?${sParams}`,
          /*new window*/ true
        );
      },

      _saveChanges: () =>
        new Promise((reslove, reject) => {
          const fnSuccess = (oDataResponse) => {
            try {
              // check for odata response status code
              const oResponse = oDataResponse.__batchResponses[0];

              const bError = parseInt(oResponse.response.statusCode) >= 400;
              if (bError) {
                // error in odata request
                reject(JSON.parse(oResponse.response.body).error.message.value);
              }

              // if no errors, resolve the promise
              reslove(oDataResponse);
            } catch (error) {
              const oChangeResponse =
                oDataResponse.__batchResponses[0].__changeResponses[0];
              const bChangeResponseError =
                parseInt(oChangeResponse.statusCode) >= 400;

              if (!bChangeResponseError) {
                reslove(oDataResponse);
              }

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
