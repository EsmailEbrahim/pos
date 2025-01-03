import { defineStore } from "pinia";
import { useAuthStore } from "./Auth.js";
import router from "../router";
import { useAlert } from "./Alert.js";
import { useTableStore } from "./Table.js";
import { useMenuStore } from "./Menu.js";

export const tabFunctions = defineStore("tabClick", {
    state: () => ({
        auth: useAuthStore(),
        alert: useAlert(),
        menu: useMenuStore(),
        table: useTableStore(),
    }),
    getters: {
        isLoginPage() {
            return router.currentRoute.value.path === "/login";
        },
        currentTab() {
            return router.currentRoute.value.path;
        },
    },
    actions: {
        checkActiveTable() {
            if (!this.table.selectedTable) {
                this.alert
                    .createAlert(
                        "لا توجد طاولة مُختارة",
                        "الرجاء اختيار طاولة",
                        "موافق"
                    )
                    .then(() => {
                        router.push("/Table");
                    });
            }
        },
        clickMenuTab() {
            // if (!this.auth.cashier && !this.table.selectedTable) {
            // if (!this.table.selectedTable && (this.menu.selectedOrderType == 'Dine In' || this.menu.selectedOrderType == 'Take Away')) {
            if (!this.table.selectedTable) {
                this.alert
                    .createAlert(
                        "لا توجد طاولة مُختارة",
                        "الرجاء اختيار طاولة",
                        "موافق"
                    )
                    .then(() => {
                        router.push("/Table");
                    });
            }
            if (this.auth.cashier && !this.menu.selectedOrderType) {
                this.alert
                    .createAlert(
                        "لا يوجد نوع طلب",
                        "الرجاء اختيار نوع الطلب",
                        "موافق"
                    )
                    .then(() => {
                        router.push("/Table");
                    });
            }
            if (
                this.auth.cashier &&
                this.menu.selectedOrderType === "Aggregators" &&
                !this.menu.selectedAggregator
            ) {
                this.alert
                    .createAlert("لا تطبيقات وسيطة مُختارة", "الرجاء اختيار تطبيق وسيط", "موافق")
                    .then(() => {
                        router.push("/Table");
                    });
            }
        },
    },
});
