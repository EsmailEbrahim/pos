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
        destroyItem: null,
        destroyQuantity: null,
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
                this.destroyItem &&
                this.destroyQuantity &&
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
                        item: this.destroyItem,
                        quantity: this.destroyQuantity,
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

        updateItem() {
            if (this.destroyItem) {
                this.destroyQuantity = this.destroyItem.qty;
            } else {
                this.destroyQuantity = null;
            }
        },

        clearDestroyData() {
            this.destroyUsername = null;
            this.destroyPassword = null;
            this.destroyInvoiceNo = null;
            this.destroyItem = null;
            this.destroyQuantity = null;
            this.destroyAccountability = null;
            this.destroyNotes = null;
        }
    },
});
