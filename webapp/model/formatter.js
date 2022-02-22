sap.ui.define([], function () {
  "use strict";

  return {
    RAGIcon: (sRagStatus) => {
      let sReturn = "";

      if (sRagStatus === "R") {
        sReturn = "sap-icon://status-negative";
      } else if (sRagStatus === "A") {
        sReturn = "sap-icon://status-inactive";
      } else if (sRagStatus === "G") {
        sReturn = "sap-icon://status-positive";
      }

      return sReturn;
    },

    RAGStatus: (sRagStatus) => {
      let sReturn = sap.ui.core.ValueState.None;

      if (sRagStatus === "R") {
        sReturn = sap.ui.core.ValueState.Error;
      } else if (sRagStatus === "A") {
        sReturn = sap.ui.core.ValueState.Warning;
      } else if (sRagStatus === "G") {
        sReturn = sap.ui.core.ValueState.Success;
      }

      return sReturn;
    },

    keyText: function (sKey, sValue) {
      let sReturn = "";

      if (sValue) {
        sReturn = `${sValue} (${sKey})`;
      }

      return sReturn;
    },
  };
});
