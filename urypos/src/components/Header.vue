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
                <a :href="'/urypos'" class="flex items-center justify-between">
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
                        نوع الطلب: {{ this.menu.selectedOrderType }}
                    </h3>

                    <h3 v-if="this.recentOrders.orderNumber" :class="[this.recentOrders.orderNumber === 'جديد' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500', 'mx-4 rounded border px-2 py-2.5 text-center text-md font-medium']">
                        طلب: {{ this.recentOrders.orderNumber }}
                    </h3>

                    <h3 v-if="this.table.invoiceNo || invoiceData.invoiceNumber" :class="['border-red-500 text-red-500', 'mx-4 rounded border px-2 py-2.5 text-center text-md font-medium']">
                        فاتورة: {{ this.table.invoiceNo || invoiceData.invoiceNumber }}
                    </h3>
                </div>

                <div>
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
                                        @click="this.auth.logOut"
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
                <a :href="'/urypos'" class="flex items-center justify-between">
                    <img v-if="system_settings.restaurant_system_settings.show_system_logo_in_header" :src="PosSystemLogoPath" alt="" class="h-10 w-10"/>
                    <p v-if="system_settings.restaurant_system_settings.show_system_name_in_login_header" class="text-blue-700 text-2xl lg:text-3xl md:text-3xl font-bold mx-2"> {{ system_settings.restaurant_system_settings.system_name || "Restaurant POS" }} </p>
                </a>
            </div>
        </nav>
    </div>
</template>

<script>
import { useAuthStore } from "@/stores/Auth.js";
import { posOpening } from "@/stores/posOpening.js";
import { posClosing } from "@/stores/posClosing.js";
import PosSystemLogo from "@/assets/logos/trilogy_icon.png";
import { tabFunctions } from "@/stores/bottomTabs.js";
import { useTableStore } from "@/stores/Table.js";
import { useRestaurantSystemSettings } from "@/stores/RestaurantSystemSettings.js";
import { usetoggleRecentOrder } from "@/stores/recentOrder.js";
import { useMenuStore } from "@/stores/Menu.js";
import { useInvoiceDataStore } from "@/stores/invoiceData.js";

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

    return { auth, posOpen, posClose, tabClick, table, settings, recentOrders, menu, invoiceData };
  },
  data() {
    return {
        PosSystemLogoPath: PosSystemLogo,
        system_settings: this.settings,
    };
  },
};
</script>
