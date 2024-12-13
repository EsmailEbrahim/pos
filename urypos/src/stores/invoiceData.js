import { defineStore } from "pinia";
import router from "../router";
import { useTableStore } from "./Table.js";
import { useMenuStore } from "./Menu.js";
import { useCustomerStore } from "./Customer.js";
import { useNotifications } from "./Notification.js";
import { usetoggleRecentOrder } from "./recentOrder.js";
import { useAlert } from "./Alert.js";
import { useAuthStore } from "./Auth.js";
import frappe from "./frappeSdk.js";

import {
    printWithQz,
    loadQzPrinter,
    disconnectQzPrinter,
} from "./utils/PrintWithQz";

export const useInvoiceDataStore = defineStore("invoiceData", {
    state: () => ({
        waiter: "",
        cashier: "",
        warehouse: "",
        posProfile: "",
        defaultModeOfPayment: "Cash",
        branch: null,
        printer: null,
        qz_host: null,
        company: null,
        currency: null,
        qz_print: null,
        paidLimit: null,
        print_type: null,
        grandTotal: null,
        total_qty: null,
        print_format: null,
        cancelReason: null,
        invoiceNumber: null,
        tableInvoiceNo: null,
        tableAttention: null,
        modeOfPaymentList: null,
        showUpdateButtton: true,
        isChecked: false,
        isPrinting: false,
        showDialog: false,
        invoiceUpdating: false,
        cancelInvoiceFlag: false,
        invoiceDetails: [],
        previousOrderItem: [],
        db: frappe.db(),
        call: frappe.call(),
        alert: useAlert(),
        auth: useAuthStore(),
        menu: useMenuStore(),
        table: useTableStore(),
        customers: useCustomerStore(),
        notification: useNotifications(),
        recentOrders: usetoggleRecentOrder(),
    }),
    actions: {
        async fetchInvoiceDetails() {
            try {
                await this.call.get("ury.ury_pos.api.getPosProfile").then((result) => {
                    this.invoiceDetails = result.message;
                    this.tableAttention = this.invoiceDetails.tableAttention;
                    this.warehouse = this.invoiceDetails.warehouse;
                    this.posProfile = this.invoiceDetails.pos_profile;
                    this.waiter = this.invoiceDetails.waiter;
                    this.cashier = this.invoiceDetails.cashier;
                    this.branch = this.invoiceDetails.branch;
                    this.company = this.invoiceDetails.company;
                    this.print_format = this.invoiceDetails.print_format;
                    this.qz_print = this.invoiceDetails.qz_print;
                    this.qz_host = this.invoiceDetails.qz_host;
                    this.print_type = this.invoiceDetails.print_type;
                    this.printer = this.invoiceDetails.printer;
                    this.paidLimit = this.invoiceDetails.paid_limit;
                    if (this.qz_host) {
                        loadQzPrinter(this.qz_host);
                    }
                    this.db
                        .getDoc("Company", this.company)
                        .then((doc) => {
                            this.db
                                .getDoc("Currency", doc.default_currency)
                                .then((currency) => {
                                    this.currency = currency.symbol;
                                })
                                .catch((error) => {
                                    if (error._server_messages) {
                                        this.alert.createAlert(
                                            "رسالة",
                                            "You do not have Read or Select Permissions for Currency",
                                            "موافق"
                                        );
                                    }
                                });
                        })
                        .catch((error) => {
                            if (error._server_messages) {
                                this.alert.createAlert(
                                    "رسالة",
                                    "You do not have Read or Select Permissions for Company",
                                    "موافق"
                                );
                            }
                        });
                });
            } catch (error) {
                if (error._server_messages) {
                    const messages = JSON.parse(error._server_messages);
                    const message = JSON.parse(messages[0]);
                    this.alert.createAlert("رسالة", message.message, "موافق");
                }
            }
            this.call
                .get("ury.ury_pos.api.getModeOfPayment")
                .then((result) => {
                    this.modeOfPaymentList = result.message;
                })
                .catch((error) => {
                    // console.error(error)
                });
        },

        // Method for creating an invoice
        async invoiceCreation() {
            this.showUpdateButtton = false;
            this.invoiceUpdating = true;
            let selectedTables = "";
            let cart = this.menu.cart;
            const customerName = this.customers.search;
            const ordeType =
                this.menu.selectedOrderType || this.recentOrders.pastOrderType;
            const numberOfPax = this.customers.numberOfPax;
            let invoice =
                this.recentOrders.draftInvoice ||
                this.table.invoiceNo ||
                this.invoiceNumber ||
                null;
            let lastInvoice =
                this.invoiceNumber ||
                this.recentOrders.draftInvoice ||
                this.table.invoiceNo ||
                null;

            selectedTables =
                this.table.selectedTable || this.recentOrders.restaurantTable;
            const cartCopy = JSON.parse(JSON.stringify(cart));
            let waiter =
                this.table.previousWaiter !== null &&
                    this.table.previousWaiter !== undefined
                    ? this.table.previousWaiter
                    : this.recentOrders.recentWaiter !== null &&
                        this.recentOrders.recentWaiter !== undefined
                        ? this.recentOrders.recentWaiter
                        : this.waiter;

            const creatingInvoice = {
                table: selectedTables,
                customer: customerName,
                items: cart,
                no_of_pax: numberOfPax,
                mode_of_payment: this.defaultModeOfPayment,
                cashier: this.cashier,
                waiter: waiter,
                last_modified_time: this.table.modifiedTime,
                pos_profile: this.posProfile,
                invoice: invoice,
                aggregator_id: this.menu.aggregatorId,
                order_type: ordeType,
                last_invoice: lastInvoice,
                comments: this.menu.comments,
                room: this.table.selectedRoom,
            };
            if (!this.auth.cashier && !numberOfPax) {
                this.alert.createAlert(
                    "رسالة",
                    "Please Select Customer / No of Pax",
                    "موافق"
                );
                this.showUpdateButtton = true;
                this.invoiceUpdating = false;
            } else if (!this.auth.cashier && !selectedTables) {
                this.alert.createAlert("رسالة", "Please Select a Table", "موافق");
                this.showUpdateButtton = true;
                this.invoiceUpdating = false;
            } else if (this.auth.cashier && !ordeType && !selectedTables) {
                this.alert.createAlert("رسالة", "Please Select Order Type", "موافق");
                this.showUpdateButtton = true;
                this.invoiceUpdating = false;
            } else {
                this.call
                    .post(
                        "ury.ury.doctype.ury_order.ury_order.sync_order",
                        creatingInvoice
                    )
                    .then((response) => {
                        this.showUpdateButtton = true;
                        if (response.message.status === "Failure") {
                            const alert = response._server_messages;
                            const messages = JSON.parse(alert);
                            const message = JSON.parse(messages[0]);

                            this.alert
                                .createAlert("رسالة", message.message, "موافق")
                                .then(() => {
                                    router.push("/Table").then(() => {
                                        window.location.reload();
                                    });
                                });
                        } else {
                            this.invoiceNumber = response.message.name;
                            this.grandTotal = response.message.grand_total;
                            this.total_qty = response.message.items.reduce((sum, item) => sum + item.qty, 0);
                            this.notification.createNotification("تم تحديث الطلب");
                            this.table.handleRoomChange();
                            this.menu.comments = "";
                            let items = this.menu.items;
                            items.forEach((item) => {
                                item.comment = "";
                            });
                            this.previousOrderItem.splice(0, this.previousOrderItem.length);
                            this.previousOrderItem.splice(
                                0,
                                this.previousOrderItem.length,
                                ...cartCopy
                            );
                            this.invoiceUpdating = false;
                            this.table.modifiedTime = response.message.modified;
                            if (this.auth.cashier) {
                                router.push("/recentOrder").then(() => {
                                    this.recentOrders.viewRecentOrder(response.message);
                                    this.clearDataAfterUpdate();
                                    this.menu.pickOrderType();
                                });
                            }
                        }
                    })
                    .catch((error) => {
                        this.showUpdateButtton = true;
                        this.invoiceUpdating = false;
                        if (error._server_messages) {
                            const messages = JSON.parse(error._server_messages);
                            const message = JSON.parse(messages[0]);
                            this.alert.createAlert("رسالة", message.message, "موافق");
                        }
                    });
            }
        },

        clearDataAfterUpdate() {
            this.menu.items.forEach((item) => {
                item.comment = "";
                item.qty = "";
            });
            this.recentOrders.restaurantTable = "";
            this.table.selectedTable = "";
            this.customers.numberOfPax = "";
            this.menu.cart = [];
            this.recentOrders.draftInvoice = "";
            this.menu.selectedAggregator = "";
            this.invoiceNumber = "";
            this.tableInvoiceNo = "";
            this.customers.customerFavouriteItems = "";
            this.customers.search = "";
            this.recentOrders.pastOrderType = "";
            this.recentOrders.showOrder = false;
            this.recentOrders.invoiceNumber = "";
            this.recentOrders.setBackground = "";
            this.recentOrders.recentOrderListItems = [];
            this.recentOrders.texDetails = [];
            this.recentOrders.orderType = "";
            this.recentOrders.netTotal = 0;
            this.recentOrders.payments = [];
            this.recentOrders.grandTotal = 0;
            // this.recentOrders.total_qty = 0;
            this.recentOrders.paidAmount = 0;
            this.recentOrders.billAmount = 0;
            this.menu.aggregatorItem = []
            this.recentOrders.invoiceNumber = "";
            this.recentOrders.selectedOrder = [];
            this.recentOrders.selectedTable = "";
            this.customers.selectedOrderType = "";
            this.menu.selectedOrderType = "";
            this.recentOrders.selectedStatus = "Unbilled";
            this.recentOrders.handleStatusChange();
        },
        billing(table) {
            let tables = table.name;
            const getOrderInvoice = {
                table: tables,
            };
            this.call
                .get(
                    "ury.ury.doctype.ury_order.ury_order.get_order_invoice",
                    getOrderInvoice
                )
                .then((result) => {
                    this.tableInvoiceNo = result.message.name;
                    if (
                        !this.auth.hasAccess &&
                        !this.auth.cashier &&
                        this.auth.sessionUser !== result.message.waiter
                    ) {
                        this.alert.createAlert(
                            "رسالة",
                            "تم حظر الطباعة، الطاولة مسندة إلى " +
                            result.message.waiter,
                            "موافق"
                        );
                    } else {
                        this.isPrinting = true;
                        this.printFunction();
                    }
                })
                .catch((error) => console.error(error));
        },
        printFunction: async function () {
            this.isPrinting = true;
            let invoiceNo =
                this.recentOrders.invoiceNumber ||
                this.tableInvoiceNo ||
                this.invoiceNumber;
            try {
                if (this.print_type === "qz") {
                    const printHTML = {
                        doc: "POS Invoice",
                        name: invoiceNo,
                        print_format: this.print_format,
                        _lang: "en",
                    };
                    const result = await this.call.get(
                        "frappe.www.printview.get_html_and_style",
                        printHTML
                    );
                    if (!result?.message?.html) {
                        this.isPrinting = false;
                        this.alert.createAlert(
                            "رسالة",
                            "Error while getting the HTML document to print for QZ",
                            "موافق"
                        );
                    }

                    const print = await printWithQz(this.qz_host, result?.message?.html);

                    if (print === "printed") {
                        this.notification.createNotification("تمت الطباعة بنجاح");
                        const updatePrintTable = {
                            invoice: invoiceNo,
                        };
                        this.call
                            .post("ury.ury.api.ury_print.qz_print_update", updatePrintTable)
                            .then(() => {
                                window.location.reload();
                                return 200;
                            })
                            .catch((error) => console.error(error, "printed"));
                    }
                } else if (this.print_type === "network") {
                    if (this.auth.cashier) {
                        const sendObj = {
                            doctype: "POS Invoice",
                            name: invoiceNo,
                            printer_setting: this.printer,
                            print_format: this.print_format,
                        };
                        const printingCall = async () => {
                            const res = await this.call.post(
                                "ury.ury.api.ury_print.network_printing",
                                sendObj
                            );
                            return res.message;
                        };
                        let i = 0;
                        let errorMessage = "";
                        do {
                            const res = await printingCall();
                            if (res === "Success") {
                                this.notification.createNotification("تمت الطباعة بنجاح");
                                const sendObj = {
                                    invoice: invoiceNo,
                                };
                                await this.call
                                    .post("ury.ury.api.ury_print.qz_print_update", sendObj)
                                    .then(() => {
                                        window.location.reload();
                                        return 200;
                                    });
                            }
                            errorMessage = res;
                            i++;
                        } while (i < 1);
                        throw {
                            alert: this.alert.createAlert(
                                "رسالة",
                                `Message:${errorMessage}`,
                                "موافق"
                            ),
                            custom: (this.isPrinting = false),
                        };
                    } else {
                        const networkPrint = {
                            invoice_id: invoiceNo,
                            pos_profile: this.posProfile,
                        };
                        const networkPrintPrintingCall = async () => {
                            const res = await this.call.post(
                                "ury.ury.api.ury_print.select_network_printer",
                                networkPrint
                            );
                            return res.message;
                        };
                        let i = 0;
                        let errorMessage = "";
                        do {
                            const res = await networkPrintPrintingCall();
                            if (res === "Success") {
                                this.notification.createNotification("تمت الطباعة بنجاح");
                                const sendObj = {
                                    invoice: invoiceNo,
                                };
                                await this.call
                                    .post("ury.ury.api.ury_print.qz_print_update", sendObj)
                                    .then(() => {
                                        window.location.reload();
                                        return 200;
                                    });
                            }
                            errorMessage = res;
                            i++;
                        } while (i < 1);
                        throw {
                            alert: this.alert.createAlert(
                                "رسالة",
                                `Message:${errorMessage}`,
                                "موافق"
                            ),
                            custom: (this.isPrinting = false),
                        };
                    }
                } else {
                    const sendObj = {
                        doctype: "POS Invoice",
                        name: invoiceNo,
                        print_format: this.print_format,
                    };
                    this.call
                        .post("ury.ury.api.ury_print.print_pos_page", sendObj)
                        .then((result) => {
                            this.notification.createNotification("تمت الطباعة بنجاح");
                            // window.location.reload();
                            router.push("/recentOrder").then(() => {
                                this.isPrinting = false;
                                this.table.handleRoomChange();
                                this.recentOrders.selectedStatus = "Draft";
                                this.recentOrders.handleStatusChange();
                                // this.recentOrders.viewRecentOrder(recentOrder); // handle setting the invoice of the table
                                // this.recentOrders.showPayment = true; // after setting the invoice of the table incomment it
                            });

                            return result.message;
                        })
                        .catch((error) => console.error(error));
                }
            } catch (e) {
                if (e?.custom) {
                    this.isPrinting = false;

                    return this.alert.createAlert("خطأ", e?.title, "موافق");
                }
            }
        },

        loadPrinter: async function (qz_host) {
            try {
                const res = await loadQzPrinter(url, qz_host);
                print(qz_host);
                if (res === "success")
                    this.notification.createNotification("تم تحميل الطابعة");
            } catch (err) {
                this.alert.createAlert("رسالة", err.message, "موافق");
            }
        },

        showCancelInvoiceModal() {
            this.call
                .get("ury.ury.api.button_permission.cancel_check")
                .then((result) => {
                    if (result.message === true) {
                        this.cancelInvoiceFlag = true;
                        this.cancelReason = "";
                    } else {
                        this.alert.createAlert(
                            "رسالة",
                            "ليس لديك إذن للإلغاء",
                            "موافق"
                        );
                        this.cancelInvoiceFlag = false;
                        this.cancelReason = "";
                    }
                })
                .catch((error) => {
                    // console.error(error)
                });
        },
        cancelInvoice: async function () {
            const recentOrders = usetoggleRecentOrder();
            let invoiceNo =
                recentOrders.invoiceNumber ||
                this.invoiceNumber ||
                this.table.invoiceNo;

            const updatedFields = {
                invoice_id: invoiceNo,
                reason: this.cancelReason,
            };
            this.call
                .post("ury.ury.doctype.ury_order.ury_order.cancel_order", updatedFields)
                .then(() => {
                    this.notification.createNotification("تم إلغاء الفاتورة");
                    router.push("/Table").then(() => {
                        window.location.reload();
                    });
                })
                .catch((error) => console.error(error));
        },
    },
});
