import { defineStore } from "pinia";
import { useTableStore } from "./Table.js";
import { useMenuStore } from "./Menu.js";
import { useInvoiceDataStore } from "./invoiceData.js";
import frappe from "./frappeSdk.js";
import { usetoggleRecentOrder } from "./recentOrder.js";
import { useAuthStore } from "@/stores/Auth.js";

import axios from "axios";
import { useAlert } from "./Alert.js";

axios.defaults.baseURL = frappe.url;

export const useDestroyStore = defineStore("destroy", {
    state: () => ({
        showDestroyModal: false,
        destroyUsername: null,
        destroyPassword: null,
        destroyInvoiceNo: null,
        destroyItems: [{ item: null, quantity: null }],
        destroyAccountability: null,
        destroyNotes: null,
        
        call: frappe.call(),
        auth: frappe.auth(),
        authStore: useAuthStore(),
        alert: useAlert(),
        invoiceData: useInvoiceDataStore(),
        recentOrders: usetoggleRecentOrder(),
        table: useTableStore(),
    }),
    getters: {

    },
    actions: {
        async confirmDestroy() {
            if (
                this.destroyItems.length > 0 &&
                this.destroyAccountability &&
                this.destroyUsername &&
                this.destroyPassword
            ) {
                try {
                    this.destroyInvoiceNo =
                        this.recentOrders.invoiceNumber ||
                        this.invoiceData.invoiceNumber ||
                        this.table.invoiceNo;

                    const response = await this.call.post("ury.ury.api.void_items.process_void_item", {
                        invoice_no: this.destroyInvoiceNo,
                        items: this.destroyItems,
                        accountability: this.destroyAccountability,
                        notes: this.destroyNotes,
                        username: this.destroyUsername,
                        password: this.destroyPassword,
                        pos_profile: this.invoiceData.posProfile,
                        session_user: this.authStore.sessionUser,
                    });

                    if (response.message.success) {
                        this.alert.createAlert("نجاح", "تمت عملية الإتلاف بنجاح.", "موافق");
                        this.showDestroyModal = false;
                        this.clearDestroyData();
                    } else {
                        this.alert.createAlert("خطأ", response.message.message, "موافق");
                    }
                } catch (error) {
                    console.error("خطأ في معالجةالإتلاف:", error);
                    this.alert.createAlert("خطأ", "خطأ في معالجة الإتلاف.", "موافق");
                    this.showDestroyModal = false;
                    this.clearDestroyData();
                }
            } else {
                this.alert.createAlert("خطأ", "يرجى إدخال جميع الحقول.", "موافق");
            }
        },

        addDestroyItem() {
            this.destroyItems.push({ item: null, quantity: null });
        },

        updateItem(index) {
            if (this.destroyItems[index].item) {
                this.destroyItems[index].quantity = this.destroyItems[index].item.qty;
            } else {
                this.destroyItems[index].quantity = null;
            }
        },

        clearDestroyData() {
            this.destroyUsername = null;
            this.destroyPassword = null;
            this.destroyInvoiceNo = null;
            this.destroyItems = [{ item: null, quantity: null }];
            this.destroyAccountability = null;
            this.destroyNotes = null;
        }
    },
});
