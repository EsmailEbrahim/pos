<template>
    <div class="mt-3 flex flex-col md:flex-row">
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-300 bg-opacity-50 text-lg"
            v-if="this.invoiceData.isPrinting">
            طباعة الفاتورة
        </div>

        <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-300 bg-opacity-50 text-lg"
            v-if="this.recentOrders.isLoading">
            جاريٍ معالجة الدفع
        </div>
        <div
            class="max-w-lg flex-1 rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800 sm:p-8 md:ml-4">
            <div class="mb-4 flex items-center justify-between">
                <h5 class="text-xl font-bold leading-none text-gray-900 dark:text-white">
                    الطلبات الأخيرة
                </h5>
            </div>
            <div class="w-full" @click="this.recentOrders.showOrder = false">
                <div class="flex">
                    <input type="search" id="orderSeach"
                        class="block ml-1 w-2/3 rounded-lg border-gray-300 bg-gray-50 p-2.5 pl-5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        placeholder="البحث برقم الفاتورة أو اسم العميل" v-model="this.recentOrders.searchOrder"
                        @click="this.recentOrders.searchTable = ''"
                    />
                    <input type="search" id="tableSeach"
                        class="block w-1/3 rounded-lg border-gray-300 bg-gray-50 p-2.5 pl-5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        placeholder="البحث برقم الطاولة" v-model="this.recentOrders.searchTable"
                        @click="this.recentOrders.searchOrder = ''"
                    />
                </div>
                <select id="status"
                    class="mt-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    v-model="this.recentOrders.selectedStatus" @change="this.recentOrders.handleStatusChange" @click="this.recentOrders.showPayment = false;">
                    <option value="Unconfirmed">غير مؤكدة</option>
                    <option value="Unbilled">مؤكدة/غير مطبوعة</option>
                    <option value="Draft">غير مدفوعة</option>
                    <option value="Recently Paid" v-if="auth.viewAllStatus === 0 && invoiceData.paidLimit > 0">مدفوعة مؤخرًا</option>
                    <option value="Paid" v-if="this.auth.viewAllStatus === 1">مدفوعة</option>
                    <option value="Consolidated" v-if="this.auth.viewAllStatus === 1">تمت تسويتها</option>
                    <option value="Return" v-if="this.auth.viewAllStatus === 1">مرتجعة</option>
                </select>
            </div>
            <div class="flow-root">
                <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-700">
                    <li class="mt-2 py-3 sm:py-4" :class="{
                            'bg-gray-200': this.recentOrders.setBackground === index,
                        }"
                        v-for="(recentOrder, index) in this.recentOrders.filteredOrders" :key="recentOrder.name"
                        @click="this.recentOrders.viewRecentOrder(recentOrder); this.recentOrders.setBackground = index; this.recentOrders.showPayment = false;"
                    >
                        <div class="flex items-center space-x-4">
                            <div class="flex-1">
                                <p class="truncate text-base font-medium text-gray-900 dark:text-white">
                                    {{ recentOrder.name }}
                                </p>
                                <p class="truncate text-sm text-gray-600 dark:text-gray-400">
                                    {{ recentOrder.customer }}
                                </p>
                            </div>
                            <div class="flex-1 items-center text-center">
                                <p class="text-base font-medium text-gray-900 dark:text-white">
                                    {{
                                        recentOrder.restaurant_table
                                            ? recentOrder.restaurant_table
                                            : this.menu.orderTypeTranslations[recentOrder.order_type] || recentOrder.order_type
                                    }}
                                </p>
                            </div>
                            <div class="flex-1 items-center space-x-4 text-right">
                                <div class="flex-1">
                                    <p class="truncate text-base font-medium text-gray-900 dark:text-white">
                                        {{ this.invoiceData.currency }}
                                        {{ recentOrder.grand_total }}
                                    </p>
                                    <p class="truncate text-sm text-gray-600 dark:text-gray-400">
                                        {{
                this.recentOrders.getFormattedTime(
                    recentOrder.posting_time
                )
            }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="mt-4 flex justify-center">
                <button :class="{ hidden: this.recentOrders.currentPage === 1 }"
                    @click="this.recentOrders.previousPageClick()" class="mr-2 w-[80px] rounded-md border px-2 py-1">
                    السابق
                </button>
                <button class="mr-2 rounded-md border px-2 py-1">
                    {{ this.recentOrders.currentPage }}
                </button>
                <button @click="this.recentOrders.nextPageClick()" v-if="this.recentOrders.next"
                    class="w-[80px] rounded-md border px-2 py-1">
                    التالي
                </button>
            </div>
        </div>
        <div class="mt-5 max-w-lg flex-1 rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800 sm:p-8 md:ml-4 md:mt-0"
            v-if="this.recentOrders.showOrder">
            <div class="flex items-center space-x-4">
                <div class="min-w-0 flex-1">
                    <p class="truncate text-xl font-semibold text-gray-900 dark:text-white">
                        {{ this.recentOrders.selectedOrder.customer }}
                    </p>
                    <p class="mr-2 mt-2 truncate text-sm text-gray-500 dark:text-gray-400">
                        {{ this.recentOrders.postingDate }}
                    </p>

                    <p class="mr-2 mt-2 truncate text-sm text-gray-500 dark:text-gray-400"
                        v-if="this.recentOrders.selectedOrder.waiter">
                        الكاشير: {{ this.recentOrders.selectedOrder.waiter }}
                    </p>
                </div>
                <div class="items-center space-x-4 text-right">
                    <div class="min-w-0 flex-1">
                        <p class="mr-2 truncate text-xl font-semibold text-gray-900 dark:text-white">
                            <span class="text-sm text-gray-500">المدفوع: </span>
                            {{ this.recentOrders.selectedOrder.status === "Draft" ? "0.00" : this.recentOrders.selectedOrder.grand_total }}
                            {{ this.invoiceData.currency }}
                        </p>
                        <p class="mr-2 mt-2 truncate text-sm text-gray-500 dark:text-gray-400">
                            {{ this.recentOrders.selectedOrder.name }}
                        </p>

                        <div class="ml-5 mt-2">
                            <Badge :type="this.recentOrders.getBadgeType(
                                    this.recentOrders.selectedOrder
                                )"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                    class="bi bi-dot" viewBox="0 0 16 16">
                                    <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
                                </svg>
                                <span class="text-xs">
                                    {{ this.recentOrders.invoice_statuses_translations[this.recentOrders.selectedOrder.status] || this.recentOrders.selectedOrder.status }}
                                </span>
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mb-2 mt-4">
                <p class="truncate text-lg font-semibold text-gray-900 dark:text-white">
                    العناصر
                </p>
            </div>
            <div class="w-full rounded bg-gray-50 p-2">
                <div class="ml-2 mt-2" v-for="items in this.recentOrders.recentOrderListItems">
                    <div class="flex items-center space-x-4">
                        <div class="min-w-2 flex-1">
                            <p class="truncate text-base text-gray-800 dark:text-white">
                                {{ items.item_name }}
                            </p>
                        </div>
                        <div class="flex items-center space-x-4 text-right">
                            <p class="text-base text-gray-800 dark:text-white">
                                {{ items.qty }}
                            </p>
                        </div>
                        <div class="items-center space-x-4 text-right">
                            <p class="mr-5 truncate text-base text-gray-800 dark:text-white">
                                {{ items.amount }} {{ this.invoiceData.currency }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mb-2 mt-5">
                <p class="truncate text-lg font-semibold text-gray-900 dark:text-white">
                    الإجماليات
                </p>
            </div>
            <div class="w-full rounded bg-gray-50 p-2">
                <div class="ml-2 mt-2 flex items-center space-x-4">
                    <div class="min-w-2 flex-1">
                        <p class="truncate text-base text-gray-800 dark:text-white">
                            صافي الإجمالي
                        </p>
                    </div>

                    <div class="items-center space-x-4 text-right">
                        <p class="mr-5 truncate text-base text-gray-800 dark:text-white">
                            {{ this.recentOrders.netTotal }} {{ this.invoiceData.currency }}
                        </p>
                    </div>
                </div>
                <div class="ml-2" v-for="tax in this.recentOrders.texDetails">
                    <div class="mt-2 flex items-center space-x-4">
                        <div class="min-w-2 flex-1">
                            <p class="truncate text-base text-gray-800 dark:text-white">
                                {{ tax.description }}
                            </p>
                        </div>

                        <div class="items-center space-x-4 text-right">
                            <p class="mr-5 truncate text-base text-gray-800 dark:text-white">
                                {{ tax.rate }} {{ this.invoiceData.currency }}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="ml-2 mt-2 flex items-center space-x-4">
                    <div class="min-w-2 flex-1">
                        <p class="truncate text-base font-semibold text-gray-800 dark:text-white">
                            المجموع الإجمالي
                        </p>
                    </div>

                    <div class="items-center space-x-4 text-right">
                        <p class="mr-5 truncate text-base font-semibold text-gray-800 dark:text-white">
                            {{ this.recentOrders.grandTotal }} {{ this.invoiceData.currency }}
                        </p>
                    </div>
                </div>
            </div>
            <div
                class="mt-2 rounded px-4 py-2 text-center"
                v-if="this.recentOrders.selectedStatus !== 'Draft' &&
                    recentOrders.selectedStatus !== 'Unbilled' &&
                    recentOrders.selectedStatus !== 'Unconfirmed'"
            >
                <button type="button"
                    class="mb-2 mr-2 rounded-lg border border-gray-400 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    @click="this.invoiceData.printFunction()">
                    طباعة الإيصال
                </button>
            </div>
            <div
                class="mt-2 rounded px-4 py-2 text-center"
                v-if="
                    this.recentOrders.selectedStatus === 'Draft' ||
                    recentOrders.selectedStatus === 'Unbilled' ||
                    recentOrders.selectedStatus === 'Unconfirmed'
                "
            >
                <button type="button"
                    class="mb-2 mr-2 w-36 rounded-lg border bg-white px-5 py-2.5 text-sm font-medium focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    :class="{
                        'border-gray-200 text-gray-300':
                        this.recentOrders.orderType === 'Aggregators',
                        'border-gray-300 text-gray-700':
                        this.recentOrders.orderType !== 'Aggregators',
                    }"
                    @click="
                        this.recentOrders.orderType !== 'Aggregators'
                        ? this.recentOrders.editOrder()
                        : ''
                    "
                    v-if="recentOrders.selectedStatus === 'Unconfirmed' || this.auth.allowed_for_edit_orders"
                >
                    تعديل
                </button>
                <button type="button"
                    class="mb-2 mr-2 w-36 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    @click="this.invoiceData.confirm_order()"
                    v-if="recentOrders.selectedStatus === 'Unconfirmed'"
                >
                    تأكيد الطلب
                </button>
                <button type="button"
                    class="mb-2 mr-2 w-36 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    @click="this.invoiceData.printFunction(true)"
                    v-else-if="recentOrders.selectedStatus !== 'Unconfirmed'"
                >
                    طباعة الإيصال
                </button>
            </div>
            <div class="mt-2 rounded px-4 py-2 text-center"
                v-if="this.recentOrders.selectedStatus === 'Draft' ||
                    this.recentOrders.selectedStatus === 'Unbilled' ||
                    this.recentOrders.selectedStatus === 'Unconfirmed'"
            >
                <button type="button"
                    class="mb-2 mr-2 w-36 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    @click="this.recentOrders.billing()"
                    v-if="recentOrders.selectedStatus === 'Draft'"    
                >
                    الدفع
                </button>
                <button type="button"
                    class="border-gray-300 text-gray-700 mb-2 mr-2 w-36 rounded-lg border bg-white px-5 py-2.5 text-sm font-medium focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    @click="this.recentOrders.showCancelInvoiceModal()"
                    v-if=" this.recentOrders.selectedStatus === 'Unconfirmed' ||
                        ((this.recentOrders.selectedStatus === 'Draft' ||
                        this.recentOrders.selectedStatus === 'Unbilled' ||
                        this.recentOrders.selectedStatus === 'Unconfirmed') &&
                        this.auth.allowed_for_cancel_orders)
                    "
                >
                    إلغاء الطلب
                </button>
            </div>
            <div v-if="this.recentOrders.cancelInvoiceFlag === true"
                class="fixed inset-0 z-10 mt-20 overflow-y-auto bg-gray-100">
                <div class="mt-20 flex items-center justify-center">
                    <div class="w-full rounded-lg bg-white p-6 shadow-lg md:max-w-md">
                        <div class="flex justify-end">
                            <span class="sr-only">إغلاق</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" @click="this.recentOrders.cancelInvoiceFlag = false">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 class="mt-1 block text-right text-xl font-medium text-gray-900 dark:text-white">
                            هل أنت متأكد من الإلغاء
                        </h2>
                        <div class="relative">
                            <label for="cancelReason" class="mt-6 block text-right text-gray-900 dark:text-white">
                                السبب
                            </label>
                            <input type="text" id="cancelReason"
                                class="mt-4 w-full appearance-none rounded border p-2 leading-tight text-gray-900 shadow focus:outline-none"
                                v-model="this.recentOrders.cancelReason" />
                        </div>
                        <div class="flex justify-between p-2 px-4">
                            <button @click="this.recentOrders.cancelInvoice(); this.recentOrders.cancelInvoiceFlag = false;"
                                class="mt-6 rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600">
                                نعم
                            </button>
                            <button @click="this.recentOrders.cancelInvoiceFlag = false"
                                class="mr-3 mt-6 rounded border border-gray-300 bg-gray-50 px-3 py-2">
                                لا
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- <div v-if="this.recentOrders.showPayment" class="fixed inset-0 z-10 mt-14 overflow-y-auto bg-gray-100">
                <div class="mt-10 flex items-center justify-center">
                    <div class="h-82 w-full rounded-lg bg-white p-6 shadow-lg md:w-3/5">
                        <div class="flex justify-end">
                            <span class="sr-only">إغلاق</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" @click="this.recentOrders.showPayment = false">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 class="mt-1 block text-right text-xl font-medium text-gray-900 dark:text-white">
                            أختر طريقة الدفع
                        </h2>
                        <div class="mt-8 flex items-center justify-center">
                            <div class="w-full max-w-full overflow-x-auto">
                                <div class="flex flex-nowrap">
                                    <div
                                        v-for="(modeOfPayment, index) in recentOrders.modeOfPaymentList"
                                        :key="index"
                                        class="mr-4 w-64 flex-shrink-0 rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
                                    >
                                        <label
                                            :for="'modeofPayments-' + index"
                                            class="block text-right text-lg dark:text-white"
                                        >
                                            {{ modeOfPayment.mode_of_payment }}
                                        </label>
                                        <input
                                            :id="'modeofPayments-' + index"
                                            type="number"
                                            name="modeofPayments"
                                            class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
                                            required
                                            v-model.number="modeOfPayment.value"
                                            @click="recentOrders.calculatePaidAmount(modeOfPayment)"
                                            @input="recentOrders.changePaidAmount(modeOfPayment.mode_of_payment, $event.target.value)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-start">
                            <button
                                @click="this.recentOrders.showPayment = false; this.recentOrders.makePayment();"
                                class="mt-10 rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
                            >
                                تأكيد
                            </button>
                        </div>
                    </div>
                </div>
            </div> -->
        </div>
        <div
            v-if="this.recentOrders.showPayment"
            class="max-w-lg flex-1 rounded-lg border border-gray-200 bg-white p-2 shadow dark:border-gray-700 dark:bg-gray-800 sm:p-4"
        >
            <div class="mt-1 flex items-center justify-between">
                <h2 class="block text-right text-xl font-medium text-gray-900 dark:text-white">
                    أختر طريقة الدفع
                </h2>
                <span class="sr-only">إغلاق</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 cursor-pointer" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" @click="this.recentOrders.showPayment = false">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
            <div class="mt-8 grid grid-cols-2 gap-2 mb-4">
                <div
                    v-for="(modeOfPayment, index) in recentOrders.modeOfPaymentList"
                    :key="index"
                    class="rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
                >
                    <label
                        :for="'modeofPayments-' + index"
                        class="flex items-center justify-between text-lg dark:text-white mb-1"
                    >
                        {{ modeOfPayment.mode_of_payment }}
                        <button
                            type="button"
                            class="mr-2 rounded-full bg-blue-500 text-white py-0 p-1 hover:bg-blue-700 focus:outline-none"
                            @click="recentOrders.addModeOfPaymentToList(modeOfPayment)"
                            title="إضافة طريقة الدفع"
                        >
                            +
                        </button>
                    </label>
                    <input
                        :id="'modeofPayments-' + index"
                        type="number"
                        name="modeofPayments"
                        class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
                        required
                        v-model.number="modeOfPayment.value"
                        @click="modeOfPayment.value ? null : recentOrders.calculatePaidAmount(modeOfPayment)"
                        @input="recentOrders.changePaidAmount(modeOfPayment.mode_of_payment, modeOfPayment.sequence, $event.target.value)"
                    />
                </div>
            </div>
            <div class="flex items-center justify-between border-t">
                <div class="">
                    <p class="mr-2 truncate text-xl font-semibold text-gray-900 dark:text-white">
                        <span class="text-sm text-gray-500">إجمالي الدفع: </span>
                        {{ this.recentOrders.total }}
                        {{ this.invoiceData.currency }}
                    </p>
                    <p class="mr-2 truncate text-xl font-semibold text-gray-900 dark:text-white">
                        <span class="text-sm text-gray-500">المطلوب: </span>
                        {{ this.recentOrders.grandTotal }}
                        {{ this.invoiceData.currency }}
                    </p>
                    <p class="mr-2 truncate text-xl font-semibold text-gray-900 dark:text-white">
                        <span class="text-sm text-gray-500">الباقي: </span>
                        {{ this.recentOrders.total - this.recentOrders.grandTotal }}
                        {{ this.invoiceData.currency }}
                    </p>
                </div>
                <button
                    @click="this.recentOrders.makePayment();"
                    class="mt-10 rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600 cursor-pointer"
                >
                    تأكيد الدفع
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { usetoggleRecentOrder } from "@/stores/recentOrder.js";
import { useInvoiceDataStore } from "@/stores/invoiceData.js";
import { useAuthStore } from "@/stores/Auth.js";
import { useMenuStore } from "@/stores/Menu.js";
import { Badge } from "flowbite-vue";
export default {
    name: "RecentOrder",
    components: {
        Badge,
    },
    setup() {
        const recentOrders = usetoggleRecentOrder();
        const invoiceData = useInvoiceDataStore();
        const auth = useAuthStore();
        const menu = useMenuStore();

        return { recentOrders, invoiceData, auth, menu };
    },
    mounted() {
        this.recentOrders.handleStatusChange();
    },
};
</script>
<style>
.bg-gray-100 {
    background-color: rgba(0, 0, 0, 0.2);
}
</style>
