import { defineStore } from "pinia";
import router from "../router";
import moment from "moment";
import { useMenuStore } from "./Menu.js";
import { useCustomerStore } from "./Customer.js";
import { useNotifications } from "./Notification.js";
import { useInvoiceDataStore } from "./invoiceData.js";
import { useTableStore } from "./Table.js";
import { useAlert } from "./Alert.js";
import frappe from "./frappeSdk.js";

export const usetoggleRecentOrder = defineStore("recentOrders", {
  state: () => ({
    invoice_statuses_translations: {
      'Draft': 'مسودة',
      'Paid': 'مدفوعة',
      'Consolidated': 'تمت تسويتها',
      'Return': 'مرتجعة',
    },
    payments: [],
    pastOrder: [],
    texDetails: [],
    pastOrderdItem: [],
    recentOrderList: [],
    modeOfPaymentList: [],
    recentOrderListItems: [],
    next: false,
    netTotal: 0,
    paidAmount: 0,
    grandTotal: 0,
    total_qty: 0,
    billAmount: 0,
    currentPage: 1,
    paymentMethod: 0,
    editPrintedInvoice: 0,
    selectedStatus: "Unconfirmed",
    posProfile: "",
    searchOrder: "",
    searchTable: "",
    customerNameForBilling: "",
    previousOrderdCustomer: "",
    table: null,
    orderType: null,
    postingDate: null,
    recentWaiter: null,
    draftInvoice: null,
    cancelReason: null,
    pastOrderType: null,
    selectedTable: null,
    invoiceNumber: null,
    selectedOrder: null,
    invoicePrinted: null,
    restaurantTable: null,
    modeOfPaymentName: null,
    isLoading: false,
    isChecked: false,
    showOrder: false,
    showDialog: false,
    showPayment: false,
    cancelInvoiceFlag: false,
    alert: useAlert(),
    call: frappe.call(),
    menu: useMenuStore(),
    table: useTableStore(),
    customers: useCustomerStore(),
    notification: useNotifications(),
    invoiceData: useInvoiceDataStore(),
  }),
  getters: {
    filteredOrders() {
      return this.recentOrderList.filter((order) =>
        this.matchesSearchOrder(order)
      );
    },
    total() {
      return this.modeOfPaymentList.reduce(
        (acc, method) => acc + (method.value || 0),
        0
      );
    },
    change() {
      return this.billAmount - this.total;
    },
    orderNumber() {
      if (this.draftInvoice || this.invoiceData.invoiceNumber) {
        let orderNo = this.draftInvoice || this.invoiceData.invoiceNumber;
        return orderNo;
      } else {
        return "جديد";
      }
    },
  },
  actions: {
    addModeOfPaymentToList(modeOfPayment) {
      if (this.modeOfPaymentList.length > 0) {
        const lastSequence = this.modeOfPaymentList[this.modeOfPaymentList.length - 1].sequence;
        this.modeOfPaymentList.push({mode_of_payment: modeOfPayment.mode_of_payment, opening_amount: 0, sequence: lastSequence + 1});
      }
    },
    async getPosInvoice(selectedStatus, limit, startLimit) {
      const recentOrder = {
        status: selectedStatus,
        limit: limit,
        limit_start: startLimit,
      };
      this.call
        .get("ury.ury_pos.api.getPosInvoice", recentOrder)
        .then((result) => {
          this.recentOrderList = result.message.data;
          this.next = result.message.next;
          return this.recentOrderList, this.next;
        })
        .catch((error) => console.error(error));
    },
    async handleStatusChange() {
      this.currentPage = 1;
      let limit = 0;
      let startLimit = 0;
      if (this.selectedStatus === "Recently Paid") {
        limit = this.invoiceData.paidLimit;
        this.getPosInvoice(this.selectedStatus, limit, startLimit);
      } else {
        limit = 10;
        this.getPosInvoice(this.selectedStatus, limit, startLimit);
      }
    },
    nextPageClick() {
      this.currentPage += 1;
      const limit = 10;
      const startLimit = (this.currentPage - 1) * limit;
      this.getPosInvoice(this.selectedStatus, limit, startLimit);
    },
    previousPageClick() {
      this.currentPage -= 1;
      const limit = 10;
      const startLimit = (this.currentPage - 1) * limit;
      this.getPosInvoice(this.selectedStatus, limit, startLimit);
    },
    matchesSearchOrder(order) {
      if(this.searchOrder) {
        const query = this.searchOrder.toLowerCase();
  
        const name = order.name.toLowerCase();
        const customer = order.customer.toLowerCase();
  
        return name.includes(query) || customer.includes(query);
      }

      else if(this.searchTable) {
        const query = this.searchTable.toLowerCase();
        
        if(order.restaurant_table) {
          const restaurant_table = order.restaurant_table.toLowerCase();
  
          return restaurant_table.includes(query);
        }
        else {
          return false;
        }
      }

      else {
        return true;
      }
    },
    getBadgeType(selectedOrder) {
      if (
        selectedOrder.status === "Paid" ||
        selectedOrder.status === "Consolidated"
      ) {
        return "green";
      } else if (selectedOrder.status === "Return") {
        return "default";
      } else if (selectedOrder.status === "Draft") {
        return "red";
      }
    },
    getFormattedTime(postingTime) {
      const dateTime = moment(postingTime, "HH:mm:ss.SSSSSS");
      const formattedDateTime = dateTime.format("h:mma");
      return formattedDateTime;
    },

    async viewRecentOrder(recentOrder) {
      this.payments = [];
      if (recentOrder.name === this.invoiceNumber) return;
      this.orderType = recentOrder.order_type;
      this.netTotal = recentOrder.net_total;
      this.grandTotal = recentOrder.grand_total;
      // this.grandTotal = recentOrder.rounded_total;
      this.invoiceNumber = recentOrder.name;
      this.selectedOrder = recentOrder;
      this.selectedTable = recentOrder.restaurant_table;
      const dateTimeString = `${recentOrder.posting_date}`;
      const dateTime = moment(dateTimeString, "YYYY-MM-DD");
      this.postingDate = dateTime.format("Do MMMM");
      this.invoicePrinted = recentOrder.invoice_printed;
      const getPosInvoiceItems = {
        invoice: this.invoiceNumber,
      };
      this.call
        .get("ury.ury_pos.api.getPosInvoiceItems", getPosInvoiceItems)
        .then((result) => {
          this.recentOrderListItems = result.message[0];
          this.texDetails = result.message[1];
        })
        .catch((error) => console.error(error));
      this.showOrder = true;
    },
    async editOrder() {
      this.payments = [];
      let previousOrderdNumberOfPax = "";
      this.pastOrderdItem = "";
      this.previousOrderdCustomer = "";
      this.pastOrderType = "";
      this.menu.selectedOrderType = "";
      this.menu.selectedOrderTypeLabel = "";
      let items = this.menu.items;
      this.draftInvoice = this.invoiceNumber;
      this.editPrintedInvoice = this.invoicePrinted;
      items.forEach((item) => {
        item.qty = "";
      });
      let cart = this.menu.cart;
      cart.splice(0, cart.length);
      const getOrderInvoice = {
        doctype: "POS Invoice",
        name: this.draftInvoice,
      };
      this.call
        .get("frappe.client.get", getOrderInvoice)
        .then((result) => {
          let pastOrder = result.message;
          this.restaurantTable = pastOrder.restaurant_table;
          this.pastOrderdItem = pastOrder.items;
          this.recentWaiter = pastOrder.waiter;
          this.pastOrderType = pastOrder.order_type;
          this.menu.comments = pastOrder.custom_order_comments;
          this.table.selectedTable = pastOrder.restaurant_table;
          if (this.pastOrderType) {
            this.menu.selectedOrderType = pastOrder.order_type;
            this.menu.selectedOrderTypeLabel = this.menu.orderTypeTranslations[pastOrder.order_type] || pastOrder.order_type;
            if (this.pastOrderType === "Aggregators") {
              this.menu.selectedAggregator = pastOrder.customer;
            }
          }
          this.previousOrderdCustomer = pastOrder.customer;
          previousOrderdNumberOfPax = pastOrder.no_of_pax;
          router.push("/Menu");
          if (this.previousOrderdCustomer) {
            this.customers.search = this.previousOrderdCustomer;
            this.customers.numberOfPax = previousOrderdNumberOfPax;
            this.customers.fectchCustomerFavouriteItem();
          } else {
            this.customers.search = "";
            this.customers.numberOfPax = "";
            this.customers.customerFavouriteItems = "";
          }

          items.forEach((item) => {
            const previousItem =
              this.pastOrderdItem &&
              this.pastOrderdItem.find(
                (previousItem) => previousItem.item_name === item.item_name
              );
            if (previousItem && !item.qty) {
              const itemIndex = cart.findIndex((obj) => obj.item === item.item);
              const itemIndexExists = itemIndex !== -1;
              if (!itemIndexExists) {
                item.qty = previousItem.qty;
                item.comment = previousItem.comment;
                cart.push(item);
              }
            }
          });
        })
        .catch((error) => console.error(error));
    },
    getModeofPayment(customer) {
      if (customer) {
        const aggregator = {
          aggregator: customer,
        };
        this.call
          .get("ury.ury_pos.api.getAggregatorMOP", aggregator)
          .then((result) => {
            this.modeOfPaymentList = result.message.map((item, index) => {
              return {
                ...item,
                sequence: index + 1,
              };
            });

            // this.modeOfPaymentList = result.message;
          })
          .catch((error) => {
            if (error._server_messages) {
              const messages = JSON.parse(error._server_messages);
              const message = JSON.parse(messages[0]);
              this.alert.createAlert("رسالة", message.message, "موافق");
            }
          });
      }
    },
    billing: async function () {
      const getOrderInvoice = {
        doctype: "POS Invoice",
        name: this.invoiceNumber,
      };
      this.call
        .get("frappe.client.get", getOrderInvoice)
        .then((result) => {
          this.pastOrder = result.message;
          this.customerNameForBilling = this.pastOrder.customer;
          this.posProfile = this.pastOrder.pos_profile;
          let orderType = this.pastOrder.order_type;
          if (orderType === "Aggregators") {
            this.getModeofPayment(this.pastOrder.customer);
          } else {
            this.call
              .get("ury.ury_pos.api.getModeOfPayment")
              .then((result) => {
                this.modeOfPaymentList = result.message.map((item, index) => {
                  return {
                    ...item,
                    sequence: index + 1,
                  };
                });

                // this.modeOfPaymentList = result.message;
              })
              .catch((error) => {
                // console.error(error)
              });
          }

          this.table = this.pastOrder.restaurant_table;
          if (this.invoicePrinted === 0) {
            this.alert.createAlert(
              "تنبيه",
              "الرجاء طباعة الفاتورة قبل الدفع",
              "موافق"
            );
            this.isLoading = false;
          } else {
            this.showPayment = true;
          }
        })
        .catch((error) => console.error(error));
    },

    calculatePaidAmount(paymentMethod) {
      this.billAmount = this.grandTotal;
      let balanceAmount = this.billAmount - this.total;
      if (balanceAmount > 0) {
        paymentMethod.value = balanceAmount;
        this.paymentMethod = paymentMethod.value;
        let existingEntrySequence = this.payments.findIndex(
          (entry) => entry.sequence === paymentMethod.sequence
        );

        if (this.paymentMethod > 0) {
          // Only proceed if payment is greater than 0
          if (existingEntrySequence !== -1) {
            // Update the existing payment entry
            this.payments[existingEntrySequence].amount = this.paymentMethod;
          } else {
            // Add a new payment entry if not found
            let paidAmount = {
              mode_of_payment: paymentMethod.mode_of_payment,
              amount: this.paymentMethod,
              sequence: paymentMethod.sequence,
            };
            this.payments.push(paidAmount);
          }
        }
      }
    },

    changePaidAmount(name, sequence, value) {
      this.modeOfPaymentName = name;
      this.paidAmount = parseFloat(value) || 0;

      let existingEntrySequence = this.payments.findIndex(
        (entry) => entry.sequence === sequence
      );

      if (this.paidAmount > 0) {
        // Only add payment if it's greater than 0
        if (existingEntrySequence !== -1) {
          // Update the amount for an existing payment method
          this.payments[existingEntrySequence].amount = this.paidAmount;
        } else {
          // Add a new payment entry if not found
          let paidAmount = {
            mode_of_payment: this.modeOfPaymentName,
            amount: this.paidAmount,
            sequence: sequence,
          };
          this.payments.push(paidAmount);
        }
      } else if (existingEntrySequence !== -1) {
        // Optionally remove the payment if the amount is 0
        this.payments.splice(existingEntrySequence, 1);
      }
    },

    //Making Payment
    makePayment: async function (printInvoice=false) {
      this.isLoading = true;
      const invoicePayment = {
        table: this.selectedTable,
        invoice: this.invoiceNumber,
        customer: this.customerNameForBilling,
        cashier: this.invoiceData.cashier,
        payments: this.payments,
        pos_profile: this.posProfile,
      };

      let pay = this.payments;
      let amount = pay.reduce((total, obj) => obj.amount + total, 0);
      let r_total = this.grandTotal;
      let diff = r_total - amount;
      // if (diff > 5) {
      //   this.alert.createAlert("رسالة", "تم تجاوز الحد الأقصى للتقريب", "موافق");
      //   this.isLoading = false;
      // }
      if (diff > 0) {
        this.alert.createAlert("تحذير", "المبلغ المدفوع أصغر من المبلغ المطلوب", "موافق");
        this.isLoading = false;
      }
      else if (diff < 0) {
        this.alert.createAlert("تحذير", "المبلغ المدفوع أكبر من المبلغ المطلوب", "موافق");
        this.isLoading = false;
      }
      else {
        this.call
          .post(
            "ury.ury.doctype.ury_order.ury_order.make_invoice",
            invoicePayment
          )
          .then(() => {
            if(printInvoice) {
              this.invoiceData.printFunction(true);
            }
            
            this.showPayment = false;
            // this.notification.createNotification("تم الدفع");
            this.getPosInvoice(this.selectedStatus, 10, 0);
            this.clearData();
            this.menu.pickOrderType();
          })
          .catch((error) => {
            this.isLoading = false;
            const messages = JSON.parse(error._server_messages);
            const message = JSON.parse(messages[0]);
            this.alert.createAlert("رسالة", message.message, "موافق");
          });
      }
    },
    clearData() {
      this.menu.selectedOrderType = "";
      this.menu.selectedOrderTypeLabel = "";
      this.isLoading = false;
      this.pastOrderType = "";
      this.menu.items.forEach((item) => {
        item.comment = "";
        item.qty = "";
      });
      this.selectedStatus = "Unconfirmed";
      this.menu.cart = [];
      this.draftInvoice = "";
      this.customers.selectedOrderType = "";
      this.menu.selectedAggregator = "";
      this.invoiceData.invoiceNumber = "";
      this.customers.customerFavouriteItems = "";
      this.customers.search = "";
      this.invoiceData.tableInvoiceNo = "";
      this.pastOrderType = "";
      this.netTotal = 0;
      this.paidAmount = 0;
      this.grandTotal = 0;
      this.total_qty = 0;
      this.billAmount = 0;
      this.payments = [];
      this.showOrder = false;
      this.customerNameForBilling = "";
      this.invoiceNumber = "";
      this.setBackground = "";
      this.recentOrderListItems = [];
      this.texDetails = [];
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
              "ليس لديك إذن لإلغاء",
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
      const updatedFields = {
        invoice_id: this.invoiceNumber,
        reason: this.cancelReason,
      };
      this.call
        .post("ury.ury.doctype.ury_order.ury_order.cancel_order", updatedFields)
        .then(() => {
          this.notification.createNotification("تم إلغاء الفاتورة");
          window.location.reload();
        })
        .catch((error) => console.error(error));
    },
    toggleRecentOrders() {
      router.push("/recentOrder");
    },
  },
});
