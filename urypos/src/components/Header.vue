<template>
    <div
        class="mb-5 border-2 border-b-gray-200 border-l-white border-r-white border-t-white p-2 lg:mb-7"
    >
        <nav
            class="fixed right-0 top-0 z-20 w-full border-b border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-900"
        >
            <div
                v-if="!this.tabClick.isLoginPage"
                class="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between p-2"
            >
                <a :href="'/urypos'" class="flex items-center justify-between" v-if="system_settings.restaurant_system_settings.show_erpnext_pos_logo">
                    <img v-if="system_settings.restaurant_system_settings.show_erpnext_pos_logo" :src="ERPNextPosLogoPath" alt="" class="h-11 w-auto"/>
                </a>

                <a :href="'/urypos'" class="flex items-center justify-between" v-else>
                    <img v-if="system_settings.restaurant_system_settings.show_restaurant_image && this.table.restaurant_image" :src="this.table.restaurant_image" alt="" class="h-10 w-10"/>
                    <img v-else-if="system_settings.restaurant_system_settings.show_system_logo" :src="PosSystemLogoPath" alt="" class="h-10 w-10"/>
                    <p v-if="system_settings.restaurant_system_settings.show_restaurant_name" class="text-blue-700 text-2xl lg:text-3xl md:text-3xl font-bold mx-2"> {{ this.table.restaurant_name || "Restaurant POS" }} </p>
                    <p v-else-if="system_settings.restaurant_system_settings.show_system_name_header" class="text-blue-700 text-2xl lg:text-3xl md:text-3xl font-bold mx-2"> {{ system_settings.restaurant_system_settings.system_name || "Restaurant POS" }} </p>
                </a>

                <div class="flex">
                    <h3 v-if="this.table.selectedTable" class="mx-4 rounded border border-blue-700 px-2 py-2.5 text-center text-md font-medium text-blue-700">
                    طاولة: {{ this.table.selectedTable }}
                    </h3>

                    <h3 v-if="this.menu.selectedOrderType" class="mx-4 rounded border border-blue-700 px-2 py-2.5 text-center text-md font-medium text-blue-700">
                        نوع الطلب: {{ this.menu.selectedOrderTypeLabel }}
                    </h3>

                    <h3 v-if="this.table.invoiceNo || invoiceData.invoiceNumber" :class="['border-red-500 text-red-500', 'mx-4 rounded border px-2 py-2.5 text-center text-md font-medium']">
                        فاتورة: {{ this.table.invoiceNo || invoiceData.invoiceNumber }}
                    </h3>

                    <h3 v-else-if="this.recentOrders.orderNumber" :class="[this.recentOrders.orderNumber === 'جديد' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500', 'mx-4 rounded border px-2 py-2.5 text-center text-md font-medium']">
                        طلب: {{ this.recentOrders.orderNumber }}
                    </h3>
                </div>

                <div class="flex">
                    <button
                        style="user-select: none;"
                        class="ml-2 hover:bg-slate-300 text-blue-700 font-semibold px-6 py-1 rounded-md"
                        @click="toggleLanguage()"
                        :title="$i18n.locale == 'ar' ? 'تغيير اللغة إلى English' : 'Change Language to العربية'"
                    >
                        {{ $i18n.locale == 'ar' ? 'AR' : 'EN' }}
                    </button>
                    <button
                        style="user-select: none;"
                        class="ml-2 hover:bg-slate-300 text-blue font-semibold px-6 py-1 rounded-md"
                        @click="reloadPage()"
                        title="تحديث"
                    >
                        <svg class="w-6 h-6 text-blue-800 dark:text-blue" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 1v5h-5M2 19v-5h5m10-4a8 8 0 0 1-14.947 3.97M1 10a8 8 0 0 1 14.947-3.97"/>
                        </svg>          
                    </button>
                    <button
                        type="button"
                        class="flex rounded-full bg-gray-100 text-sm focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-400 md:mr-0"
                        id="user-menu-button"
                        aria-expanded="false"
                        data-dropdown-toggle="user-dropdown"
                        data-dropdown-placement="bottom"
                        @click="this.auth.toggleDropdown()"
                        ref="dropdownButton"
                    >
                        <div
                            class="relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-600 lg:h-11 lg:w-11"
                            v-if="this.auth.sessionUser.includes('_')"
                        >
                            <span class="font-medium text-gray-900 dark:text-gray-300"
                                >{{ this.auth.sessionUser.charAt(0).toUpperCase()
                                }}{{
                                this.auth.sessionUser
                                    .charAt(this.auth.sessionUser.indexOf("_") + 1)
                                    .toUpperCase()
                                }}
                            </span>
                        </div>
                        <div
                            class="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-600 lg:h-11 lg:w-11"
                            v-else
                        >
                            <span class="font-medium text-gray-900 dark:text-gray-300">
                                {{this.auth.sessionUser.charAt(0).toUpperCase()}}
                            </span>
                        </div>

                        <div
                            class="absolute left-6 mt-11 w-45 divide-y divide-gray-100 rounded-lg bg-white text-right shadow dark:bg-gray-700 lg:left-6"
                            v-show="this.auth.activeDropdown"
                        >
                            <ul>
                                <li>
                                    <h1
                                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                                    >
                                        {{ this.auth.getLoginAvatar() }}
                                    </h1>
                                </li>

                                <li>
                                    <a
                                        href="#"
                                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                                        @click="this.auth.routeToHome()"
                                        >التبديل إلى المكتب</a
                                    >
                                </li>
                                
                                <li v-if="this.auth.cashier">
                                    <a
                                        href="#"
                                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                                        @click="this.posOpen.routeToPosOpen"
                                    >
                                        فتح نقطة البيع
                                    </a>
                                </li>

                                <li v-if="this.auth.cashier">
                                    <a
                                        href="#"
                                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                                        @click="this.posClose.routeToPosClose"
                                    >
                                        إغلاق نقطة البيع
                                    </a>
                                </li>

                                <li v-if="true">
                                    <a
                                        href="#"
                                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                                        @click="this.getInvoiceData()"
                                    >
                                        إتلاف
                                    </a>
                                </li>

                                <li>
                                    <a
                                        href="#"
                                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                                        @click="this.auth.logOut"
                                        >تسجيل الخروج
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </button>
                </div>
            </div>

            <div
                v-else
                class="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between p-4"
            >
                <a :href="'/urypos'" class="flex items-center justify-between" v-if="system_settings.restaurant_system_settings.show_erpnext_pos_logo_login">
                    <img v-if="system_settings.restaurant_system_settings.show_erpnext_pos_logo_login" :src="ERPNextPosLogoPath" alt="" class="h-12 w-auto"/>
                </a>

                <a :href="'/urypos'" class="flex items-center justify-between" v-else>
                    <img v-if="system_settings.restaurant_system_settings.show_system_logo_in_header" :src="PosSystemLogoPath" alt="" class="h-10 w-10"/>
                    <p v-if="system_settings.restaurant_system_settings.show_system_name_in_login_header" class="text-blue-700 text-2xl lg:text-3xl md:text-3xl font-bold mx-2"> {{ system_settings.restaurant_system_settings.system_name || "Restaurant POS" }} </p>
                </a>
            </div>
        </nav>
    </div>

    <div
        v-if="this.destroyData.showDestroyModal"
        class="void-modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="this.destroyData.showDestroyModal = false; this.destroyData.clearDestroyData();"
    >
        <div
            class="w-120 rounded-lg bg-white p-5 shadow-lg dark:bg-gray-800"
            style="max-height: 90vh; overflow: hidden;"
        >
            <h2 class="mb-1 text-xl font-semibold text-gray-900 dark:text-gray-200">
                حدد عناصر للإتلاف (رقم الطلب: {{ this.invoiceNo }})
            </h2>
            <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
                الرجاء إدخال التفاصيل المطلوبة لتأكيد عملية الإتلاف.
            </p>
            
            <PerfectScrollbar
                class="overflow-hidden grid grid-cols-12 gap-2"
                style="max-height: 70vh; overflow-y: auto;"
                :options="{ suppressScrollX: true }"
            >
                <div class="col-span-12 grid grid-cols-12 gap-2">
                    <label for="cart-item" class="col-span-8 block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        اختر العنصر:
                    </label>
                    <label for="quantity" class="col-span-4 block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        الكمية للإتلاف:
                    </label>
                </div>
                <div v-for="(destroyItem, index) in this.destroyData.destroyItems" :key="index" class="ml-4 col-span-12 grid grid-cols-12 gap-2 border rounded-md p-1">
                    <div class="mb-2 col-span-12 grid grid-cols-12 gap-2">
                        <div class="col-span-8 flex items-center">
                            <span class="text-xs ml-1 opacity-50">{{ index + 1 }}-</span>
                            <select
                                id="cart-item"
                                v-model="destroyItem.item"
                                class="mb-2 w-full rounded border p-2 dark:bg-gray-700 dark:text-gray-200"
                                @change="this.destroyData.updateItem(index)"
                            >
                                <option value=""></option>
                                <option v-for="(item, itemIndex) in this.invoiceItems" :key="itemIndex" :value="item">
                                    {{ $i18n.locale === 'ar' ? item.item_name : item.item }} - الكمية: {{ item.qty }}
                                </option>
                            </select>
                        </div>
        
                        <div class="col-span-4">
                            <input
                                id="quantity"
                                type="number"
                                v-model="destroyItem.quantity"
                                placeholder="أدخل الكمية..."
                                min="1"
                                :max="destroyItem.item?.qty || 1"
                                class="w-full rounded border p-2 dark:bg-gray-700 dark:text-gray-200"
                            />
                        </div>
                    </div>
                </div>

                <div class="ml-4 mb-1 col-span-12">
                    <button
                        type="button"
                        class="rounded-full bg-blue-500 text-white py-1 p-4 hover:bg-blue-700 focus:outline-none"
                        @click="this.destroyData.addDestroyItem"
                        title="إضافة عنصر"
                    >
                        + إضافة عنصر
                    </button>
                </div>

                <div class="ml-4 col-span-12">
                    <label for="accountability" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        اختر المسؤول عن التلف:
                    </label>
                    <select
                        id="accountability"
                        v-model="this.destroyData.destroyAccountability"
                        class="mb-2 w-full rounded border p-2 dark:bg-gray-700 dark:text-gray-200"
                    >
                        <option value=""></option>
                        <option value="Chef">الطباخ</option>
                        <option value="Captain">الكابتن</option>
                        <option value="Cashier">الكاشير</option>
                        <option value="Other">آخر</option>
                    </select>
                </div>

                <div class="ml-4 col-span-12">
                    <label for="notes" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        ملاحظات:
                    </label>
                    <textarea
                        id="-notes"
                        v-model="this.destroyData.destroyNotes"
                        placeholder="أدخل الملاحظات..."
                        rows="2"
                        class="w-full rounded border p-2 dark:bg-gray-700 dark:text-gray-200"
                    ></textarea>
                </div>

                <div class="ml-4 mb-2 col-span-12">
                    <label for="username" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        اسم المستخدم:
                    </label>
                    <input
                        id="username"
                        v-model="this.destroyData.destroyUsername"
                        type="text"
                        placeholder="اسم المستخدم"
                        class="mb-2 w-full rounded border p-2 dark:bg-gray-700 dark:text-gray-200"
                    />
                    <label for="password" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        كلمة المرور:
                    </label>
                    <input
                        id="password"
                        v-model="this.destroyData.destroyPassword"
                        type="password"
                        placeholder="كلمة المرور"
                        class="w-full rounded border p-2 dark:bg-gray-700 dark:text-gray-200"
                    />
                </div>
            </PerfectScrollbar>

            <div class="flex justify-end space-x-2">
                <button
                    @click="this.destroyData.confirmDestroy(this.invoiceNo)"
                    class="rounded bg-blue-600 px-4 py-2 mx-4 text-white hover:bg-blue-700"
                >
                    موافق
                </button>
                <button
                    @click="this.destroyData.showDestroyModal = false; this.destroyData.clearDestroyData();"
                    class="rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
                >
                    إلغاء
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from "@/stores/Auth.js";
import { posOpening } from "@/stores/posOpening.js";
import { posClosing } from "@/stores/posClosing.js";
import PosSystemLogo from "@/assets/logos/trilogy_icon.png";
import ERPNextPosLogo from "@/assets/logos/erpnext_pos_logo.jpg";
import { tabFunctions } from "@/stores/bottomTabs.js";
import { useTableStore } from "@/stores/Table.js";
import { useRestaurantSystemSettings } from "@/stores/RestaurantSystemSettings.js";
import { usetoggleRecentOrder } from "@/stores/recentOrder.js";
import { useMenuStore } from "@/stores/Menu.js";
import { useInvoiceDataStore } from "@/stores/invoiceData.js";
import { useDestroyStore } from "@/stores/Destroy.js";
import { useRoute, useRouter } from 'vue-router';
import { useAlert } from "@/stores/Alert.js";

export default {
  name: "Header",
  setup() {
    const auth = useAuthStore();
    const posOpen = posOpening();
    const posClose = posClosing();
    const tabClick = tabFunctions();
    const table = useTableStore();
    const settings = useRestaurantSystemSettings();
    const recentOrders = usetoggleRecentOrder();
    const menu = useMenuStore();
    const invoiceData = useInvoiceDataStore();
    const destroyData = useDestroyStore();
    const route = useRoute();
    const router = useRouter();
    const alert = useAlert();

    return { auth, posOpen, posClose, tabClick, table, settings, recentOrders, menu, invoiceData, destroyData, route, router, alert };
  },
  data() {
    return {
        PosSystemLogoPath: PosSystemLogo,
        ERPNextPosLogoPath: ERPNextPosLogo,
        system_settings: this.settings,
        invoiceNo: null,
        invoiceItems: [],
    };
  },
  methods: {
    reloadPage() {
        if (typeof window !== "undefined") {
            window.location.reload();
        } else {
            console.error("Window object is not available.");
        }
    },
    toggleLanguage() {
        const newLang = this.$i18n.locale === 'ar' ? 'en' : 'ar';
        this.$i18n.locale = newLang;
        localStorage.setItem('lang', newLang);
    },
    getInvoiceData() {
        this.invoiceNo = null;
        this.invoiceItems = [];
        if (this.route.name === 'recentOrder' && this.route.path === '/recentOrder' && this.recentOrders.showOrder) {
            if (this.recentOrders.invoiceNumber && this.recentOrders.recentOrderListItems) {
                this.invoiceNo = this.recentOrders.invoiceNumber;
                const items = this.recentOrders.recentOrderListItems;
                items.forEach((item) => {
                    this.invoiceItems.push(
                        {
                            'item': item.item,
                            'item_name': item.item_name,
                            'qty': item.qty,
                            'rate': item.amount,
                        }
                    )
                });

                this.destroyData.showDestroyModal = true;
            }
        } else if (this.route.name === 'Menu' && this.route.path === '/Menu' && ((this.invoiceData.invoiceNumber || this.table.invoiceNo) && this.menu.cart)) {
            this.invoiceNo = this.invoiceData.invoiceNumber || this.table.invoiceNo;
            this.invoiceItems = this.menu.cart;

            this.destroyData.showDestroyModal = true;
        } else {
            this.alert.createAlert("خطأ", "لا توجد فاتورة أو طلب لعملية الإتلاف", "موافق");
        }
    },
  },
};
</script>

<style scoped>
.void-modal {
    z-index: 9999;
}
</style>
