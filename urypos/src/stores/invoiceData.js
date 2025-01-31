import { defineStore } from "pinia";
import router from "../router";
import { useTableStore } from "./Table.js";
import { useMenuStore } from "./Menu.js";
import { useCustomerStore } from "./Customer.js";
import { useNotifications } from "./Notification.js";
import { usetoggleRecentOrder } from "./recentOrder.js";
import { useAlert } from "./Alert.js";
import { useAuthStore } from "./Auth.js";
import { useRestaurantSystemSettings } from "./RestaurantSystemSettings.js";
import frappe from "./frappeSdk.js";
import { WebSocketPrinter } from './websocket-printer.js';

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
        cashier_printer_name: null,
        cashier_silent_print_format: null,
        cashier_silent_print_type: null,
        company: null,
        currency: null,
        qz_print: null,
        silent_print: null,
        enable_kitchen_controller_print: null,
        controllers_silent_printers: null,
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
        restaurant_settings: useRestaurantSystemSettings(),
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
                    this.silent_print = this.invoiceDetails.silent_print;
                    this.enable_kitchen_controller_print = this.invoiceDetails.enable_kitchen_controller_print;
                    this.controllers_silent_printers = this.invoiceDetails.controllers_silent_printers;
                    this.qz_host = this.invoiceDetails.qz_host;
                    this.cashier_printer_name = this.invoiceDetails.cashier_printer_name;
                    this.cashier_silent_print_format = this.invoiceDetails.cashier_silent_print_format;
                    this.cashier_silent_print_type = this.invoiceDetails.cashier_silent_print_type;
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
            try {
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
                // if (!this.auth.cashier && !numberOfPax) {
                if (!numberOfPax && !invoice && this.menu.selectedOrderTypeRequireTable(ordeType)) {
                    this.alert.createAlert(
                        "رسالة",
                        "الرجاء تحديد عدد الأشخاص",
                        "موافق"
                    );
                    this.showUpdateButtton = true;
                    this.invoiceUpdating = false;
                // } else if (!this.auth.cashier && !selectedTables) {
                } else if (!selectedTables && this.menu.selectedOrderTypeRequireTable(ordeType)) {
                    this.alert.createAlert(
                        "رسالة",
                        "الرجاء تحديد طاولة",
                        "موافق"
                    );
                    this.showUpdateButtton = true;
                    this.invoiceUpdating = false;
                } else if (this.auth.cashier && !ordeType && !selectedTables) {
                    this.alert.createAlert("رسالة", "الرجاء تحديد نوع الطلب", "موافق");
                    this.showUpdateButtton = true;
                    this.invoiceUpdating = false;
                } else {
                    if (!creatingInvoice.invoice) {
                        if(!this.menu.selectedOrderTypeRequireTable(creatingInvoice.order_type)) {
                            creatingInvoice.table = this.menu.getDefaultTableForOrderType(creatingInvoice.order_type);
                        }
                    }
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
            } catch(error) {
                this.alert.createAlert("خطأ", "حدث خطأ في الفاتورة!", "موافق");
                console.log("Error in creating invoice, error is: ", error);
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
            this.menu.comments = "";
            this.menu.cart = [];
            this.recentOrders.draftInvoice = "";
            this.menu.selectedAggregator = "";
            this.invoiceNumber = "";
            this.table.invoiceNo = "";
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
            this.recentOrders.selectedStatus = "Unconfirmed";
            this.recentOrders.handleStatusChange();
        },
        
        billing(table) {
            let tables = table.name;
            const getOrderInvoice = {
                table: tables,
                from_pos: true,
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
                            "الطاولة مسندة إلى " + result.message.waiter,
                            "موافق"
                        );
                    } else {
                        // this.isPrinting = true;
                        this.emptyTable(this.tableInvoiceNo);
                    }
                })
                .catch((error) => console.error(error));
        },

        confirm_order: async function (invoice_name = null) {
            this.isPrinting = true;
        
            const invoiceNo = 
                invoice_name || 
                this.recentOrders.invoiceNumber || 
                this.tableInvoiceNo || 
                this.invoiceNumber;
        
            try {
                const args = { invoice_name: invoiceNo };
                const result = await this.call.post(
                    "ury.ury.doctype.ury_order.ury_order.confirm_order",
                    args
                );
        
                if (result.message.status === "success") {
                    const KOTsPrinted = await this.printKOTs(invoiceNo);
                    const InvoicePrinted = await this.printToKitchenController(invoiceNo, KOTsPrinted.kitchen_controller_roles);
        
                    if (KOTsPrinted.status === "printed" && InvoicePrinted === "printed") {
                        window.location.reload();
                        return 200;
                    } else {
                        console.error("Error in printing KOTs!");
                        this.alert.createAlert("خطأ", "خطأ في طباعة KOTs!", "موافق");
                    }
                } else if (result?.message?.status === "error") {
                    console.error("Error to confirm order: ", result?.message?.error);
                    this.alert.createAlert("خطأ", "خطأ عند تأكيد الطلب!", "موافق");
                }
            } catch (e) {
                console.error("Error to confirm order: ", e);
                if (e?.custom) {
                    this.alert.createAlert("خطأ", e?.title, "موافق");
                }
            } finally {
                this.isPrinting = false;
            }
        },

        printKOTs: async function (invoiceNo) {
            try {
                if (this.print_type === "silent") {
                    const args = {
                        invoice_number: invoiceNo,
                        // type: 'New Order',
                    };
                    const URY_KOTs = await this.call.get('ury.ury_pos.api.get_ury_kot_by_invoice_number', args);
                    const URY_KOTs_docs = URY_KOTs.message.ury_kots;
        
                    const printPromises = URY_KOTs_docs.map((kot) =>
                        this.printSilently("URY KOT", kot.name, kot.production_silent_print_format, kot.production_silent_print_type)
                    );
        
                    const printResults = await Promise.all(printPromises);
        
                    if (printResults.every(result => result === "printed")) {
                        return {'status': "printed", "kitchen_controller_roles": URY_KOTs.message.kitchen_controller_roles};
                    } else {
                        console.error(`Printing failed for invoice: ${invoiceNo}`);
                        return {'status': "error"};
                    }
                }
            } catch (error) {
                console.error(`Error in printing process for invoice: ${invoiceNo}`, error);
                return {'status': "error"};
            }
        },

        printToKitchenController: async function (invoiceNo, kitchen_controller_roles) {
            try {
                if (this.print_type === "silent" && this.enable_kitchen_controller_print) {
                    const printPromises = this.controllers_silent_printers
                        .filter(controller_silent_printer => 
                            kitchen_controller_roles.includes(controller_silent_printer.role)
                        )
                        .map(controller_silent_printer => 
                            this.printSilently("POS Invoice", invoiceNo, controller_silent_printer.silent_print_format, controller_silent_printer.silent_print_type)
                        );
        
                    const printResults = await Promise.all(printPromises);
        
                    if (printResults.every(result => result === "printed")) {
                        return "printed";
                    } else {
                        console.error(`Printing failed for invoice: ${invoiceNo}`);
                        return "error";
                    }
                }
                else {
                    return "printed";
                }
            } catch (error) {
                console.error(`Error in printing process for invoice: ${invoiceNo}`, error);
                return "error";
            }
        },

        emptyTable: async function (tableInvoiceName = '') {
            let invoiceNo =
                this.recentOrders.invoiceNumber ||
                this.tableInvoiceNo ||
                this.invoiceNumber;
                
            const updatePrintTable = {
                invoice: tableInvoiceName ? tableInvoiceName : invoiceNo,
            };
            this.call
                .post("ury.ury.api.ury_print.qz_print_update", updatePrintTable)
                .then(() => {
                    window.location.reload();
                    return 200;
                })
                .catch((error) => {
                    console.error("حدث خطأ أثناء تفريغ الطاولة", error);
                    this.notification.createNotification("حدث خطأ أثناء تفريغ الطاولة!");
                });
        },

        printFunction: async function (isFromRecentOrders = false, tableInvoiceName = '') {
            this.isPrinting = true;
            let invoiceNo =
                this.recentOrders.invoiceNumber ||
                this.tableInvoiceNo ||
                this.invoiceNumber;
            try {
                if (this.print_type === "qz") {
                    const printHTML = {
                        doc: "POS Invoice",
                        name: tableInvoiceName ? tableInvoiceName : invoiceNo,
                        print_format: this.print_format,
                        _lang: "ar",
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

                    // if(this.cashier_printer_name) {
                        const print = await printWithQz(this.qz_host, this.cashier_printer_name, result?.message?.html);
                        if (print === "printed") {
                            this.notification.createNotification("تمت الطباعة بنجاح");
                            const updatePrintTable = {
                                invoice: tableInvoiceName ? tableInvoiceName : invoiceNo,
                            };
                            this.call
                                .post("ury.ury.api.ury_print.qz_print_update", updatePrintTable)
                                .then(() => {
                                    window.location.reload();
                                    return 200;
                                })
                                .catch((error) => console.error(error, "printed"));
                        }
                    // }
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
                } else if (this.print_type === "silent") {
                    try {
                        // const URY_KOTs = await this.call.get('ury.ury_pos.api.get_ury_kot_by_invoice_number', {
                        //     invoice_number: invoiceNo
                        // });
                        
                        const printStatus = await this.printSilently("POS Invoice", invoiceNo, this.cashier_silent_print_format, this.cashier_silent_print_type);

                        // const URY_KOTs_array = URY_KOTs.message;

                        // const printPromises = URY_KOTs_array.map(async (kot) => {
                        //     return await this.printSilently("URY KOT", kot.name, kot.production_silent_print_format, kot.production_silent_print_type);
                        // });

                        // const printResults = await Promise.all(printPromises);

                        // const allPrinted = printResults.every(result => result === "printed");

                        // if (printStatus === "printed" && allPrinted) {
                        if (printStatus === "printed") {
                            this.notification.createNotification("تمت الطباعة بنجاح");
                            const updatePrintTable = {
                                invoice: tableInvoiceName ? tableInvoiceName : invoiceNo,
                            };
                            this.call
                                .post("ury.ury.api.ury_print.qz_print_update", updatePrintTable)
                                .then(() => {
                                    window.location.reload();
                                    return 200;
                                })
                                .catch((error) => console.error(error, "printed"));
                        } else {
                            console.error("Printing failed:", printStatus);
                            this.notification.createNotification("حدث خطأ أثناء الطباعة");
                        }
                    } catch (error) {
                        console.error("Error in printing process:", error);
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
                            if(this.restaurant_settings.restaurant_system_settings.show_a_print_preview) {
                                try {
                                    this.openPrintFormatPDF(tableInvoiceName ? tableInvoiceName : invoiceNo);
                                }
                                catch {
                                    console.error("Error in print the invoice in pdf.");
                                }
                            }
                            // window.location.reload();
                            if(isFromRecentOrders) {
                                this.recentOrders.invoicePrinted = 1;
                            }
                            router.push("/recentOrder").then(() => {
                                this.isPrinting = false;
                                this.table.handleRoomChange();
                                this.recentOrders.selectedStatus = "Draft";
                                this.recentOrders.handleStatusChange().then(() => {
                                    if(tableInvoiceName) {
                                        let RecentOrderList = [];
                                        this.call
                                            .get("ury.ury_pos.api.getPosInvoice", {status: 'Draft', limit: 50, limit_start: 0})
                                            .then((result) => {
                                                RecentOrderList = result.message.data;
                                                
                                                let recentOrderObject = RecentOrderList.find((order) =>
                                                    order.name == tableInvoiceName
                                                );
                                                if(recentOrderObject) {
                                                    recentOrderObject.invoice_printed = 1;
                                                    this.recentOrders.viewRecentOrder(recentOrderObject);
                                                }
                                            })
                                            .catch((error) => console.error(error));
                                    }
                                });
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
    
        printSilently: async function(docType, docName, printFormat, printType) {
            try {        
                const response = await this.call.get('silent_print.utils.print_format.create_pdf', {
                    doctype: docType,
                    name: docName,
                    silent_print_format: printFormat,
                    no_letterhead: 1,
                    _lang: "en"
                });
        
                const printService = new WebSocketPrinter();
                printService.submit({
                    type: printType,
                    url: 'file.pdf',
                    file_content: response.message.pdf_base64,
                });

                return "printed";
            } catch (error) {
                console.error('Silent Print Error:', error);
                return "error";
            }
        },

        openPrintFormatPDF: async function (invoiceNo) {
            // const print_url = `/api/method/frappe.utils.print_format.download_pdf?doctype=POS Invoice&name=${invoiceNo}&format=POS LOFT Invoice&no_letterhead=0&letterhead=Trilogy Basic&_lang=ar`;
            const print_url = `/printview?doctype=POS%20Invoice&name=${invoiceNo}&format=${this.print_format}&no_letterhead=1&settings=%7B%7D&_lang=ar`;

            window.open(print_url, '_blank');
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
