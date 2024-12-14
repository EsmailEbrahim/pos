<template>
    <!-- <orderInfo /> -->
    <!-- <Search /> -->
    <div class="main-container flex overflow-hidden">
        <div class="course-menu px-2">
            <div class="grid grid-cols-1 gap-2 border-b border-gray-300 pb-1 pl-4">
                <button
                    class="focus:shadow-outline rounded-md bg-blue-700 px-2 py-2 text-center font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring focus:ring-blue-300"
                    type="button" :class="{ 'bg-blue-900': this.menu.displayAll }" @click="this.menu.showAllItems">
                    الكل
                </button>
                <button
                    class="focus:shadow-outline rounded-md bg-blue-700 px-2 py-2 text-center font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring focus:ring-blue-300"
                    type="button" :class="{ 'bg-blue-900': this.menu.priority }"
                    @click="this.menu.showSpecialItems">
                    المفضلة
                </button>
            </div>
            <PerfectScrollbar :options="{ suppressScrollX: true }">
                <div class="course-list grid grid-cols-2 gap-1 mt-1 pl-4">
                    <button v-for="(course, index) in menu.course" :key="index"
                        class="focus:shadow-outline rounded-md bg-blue-700 px-2 py-2 text-center font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring focus:ring-blue-300"
                        type="button" :class="{ 'bg-blue-900': this.menu.selectedCourse === course.name }"
                        @click="this.menu.displayAll = false; this.menu.selectedCourse = course.name">
                        {{ course.name }}
                    </button>
                </div>
            </PerfectScrollbar>
        </div>

        <div class="content-container flex-grow flex border-r border-gray-300">
            <div class="section-right">
                <div class="grid grid-cols-6 gap-2 p-2 border-b border-gray-300">
                    <div class="relative z-20" :class="[this.menu.selectedOrderType === 'Aggregators' ? 'col-span-4' : 'col-span-6']">
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center mx-2">
                            <svg aria-hidden="true" class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                        <input
                            type="search"
                            id="default-search"
                            placeholder="البحث عن عناصر..."
                            class="w-full pr-10 px-2 py-1 border border-gray-300 rounded-md bg-gray-50 text-md font-medium text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                            v-model="this.menu.searchTerm"
                            @input="this.menu.handleSearchInput;"
                            @click="this.menu.clearSearch"
                            autocapitalize="none"
                        />
                    </div>
                    <div class="relative col-span-2 z-20" v-if="this.menu.selectedOrderType === 'Aggregators'">
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center mx-2">
                            <svg class="h-6 w-6 text-gray-800"
                                aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    d="M15 4h3c.6 0 1 .4 1 1v15c0 .6-.4 1-1 1H6a1 1 0 0 1-1-1V5c0-.6.4-1 1-1h3m0 3h6m-3 5h3m-6 0h0m3 4h3m-6 0h0m1-13v4h4V3h-4Z" />
                            </svg>
                        </div>
                        <input
                            type="search"
                            id="aggregatorId"
                            placeholder="أدخل مُعرف التطبيق الوسيط..."
                            class="w-full pr-10 px-2 py-1 border border-gray-300 rounded-md bg-gray-50 text-md font-medium text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                            v-model="this.menu.aggregatorId"
                        />
                    </div>
                </div>
                <div class="items-section">
                    <PerfectScrollbar class="items-scroll overflow-hidden" :options="{ suppressScrollX: true }">
                        <div class="grid grid-cols-2 lg:grid-cols-6 md:grid-cols-4 sm:grid-cols-2 gap-2 pl-4 p-2" v-if="this.menu.paginatedItems.length > 0">
                            <div
                                class="rounded border px-2 py-2 text-right shadow"
                                v-for="item in this.menu.paginatedItems"
                                :key="item.item"
                            >
                                <div v-if="this.auth.viewItemImage" class="w-full h-24">
                                    <div v-if="item.item_imgae" class="w-full h-full">
                                        <img :src="this.menu.getFullImagePath(item.item_imgae)" alt="Item Image"
                                            class="w-full h-full object-cover border rounded" />
                                    </div>
                                    <div v-else class="relative w-full h-full bg-gray-100 rounded flex items-center justify-center">
                                        <div class="text-2xl text-gray-400">
                                            {{ this.menu.itemNameExtract(item.item_name) }}
                                        </div>
                                    </div>
                                </div>

                                <h2
                                    class="mt-0"
                                    :class="{
                                        'text-md overflow-hidden whitespace-nowrap text-gray-600':
                                            this.auth.viewItemImage,
                                        'mb-2 text-center text-lg font-normal leading-normal':
                                            !this.auth.viewItemImage,
                                    }"
                                >
                                    {{ item.item_name }}
                                </h2>
                                <h2
                                    class="mt-0"
                                    :class="{
                                        'text-sm font-bold': this.auth.viewItemImage,
                                        'mb-2 mt-0 text-center text-lg font-normal leading-normal':
                                        !this.auth.viewItemImage,
                                    }"
                                >
                                    {{ item.rate }} {{ this.invoiceData.currency }}
                                </h2>
                                <div v-if="!item.qty" class="text-center">
                                    <button
                                        @click="item.showInput = true; this.menu.addToCart(item);"
                                        class="rounded border px-4 py-2 text-white bg-green-400 text-xs font-medium leading-normal transition-transform duration-300 ease-in-out"
                                    >
                                        إضافة +
                                    </button>
                                </div>
                                <div v-if="item.qty" class="flex rounded text-center">
                                    <button
                                        type="button"
                                        class="-ml-px inline-flex items-center justify-center gap-2 border text-white bg-green-400 px-4 py-2 align-middle text-sm font-medium shadow-sm transition-transform duration-300 ease-in-out focus:outline-none"
                                        @click="this.menu.incrementItemQuantity(item)"
                                    >
                                        +
                                    </button>
                                    <button 
                                        type="button"
                                        id="qty_input"
                                        name="qty_input"
                                        class="block w-full border border-gray-200 text-center text-sm shadow-sm"
                                        @input="item.qty = $event.target.value"
                                        readonly
                                        @click="this.menu.showModal(item)"
                                    >
                                        {{ item.qty }}
                                    </button>
                                    <button
                                        type="button"
                                        class="inline-flex items-center justify-center gap-2 border text-white bg-red-400 px-4 py-2 align-middle text-sm font-medium shadow-sm transition-transform duration-300 ease-in-out focus:outline-none"
                                        :class="{
                                            'text-gray-700':
                                                this.recentOrders.editPrintedInvoice === 0 ||
                                                this.auth.removeTableOrderItem === 1,
                                            'text-gray-300':
                                                this.recentOrders.editPrintedInvoice === 1 ||
                                                this.auth.removeTableOrderItem === 0,
                                        }"
                                        @click="
                                            (this.recentOrders.editPrintedInvoice === 0 ||
                                            this.auth.removeTableOrderItem === 1) &&
                                            this.menu.decrementItemQuantity(item)"
                                    >
                                        -
                                        <!-- :disabled="this.recentOrders.restaurantTable" -->
                                    </button>
                                </div>
                            </div>
                            <div v-if="menu.showDialog" class="fixed inset-0 z-40 mt-20 overflow-y-auto bg-gray-100">
                                <div class="mt-10 flex items-center justify-center">
                                    <div class="w-full rounded-lg bg-white p-6 shadow-lg md:max-w-md">
                                        <div class="flex justify-end">
                                            <span class="sr-only">إغلاق</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 cursor-pointer" fill="none"
                                                viewBox="0 0 24 24" stroke="currentColor" @click="menu.showDialog = false">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>

                                        <h2 class="mt-1 block text-right text-xl font-medium text-gray-900 dark:text-white">
                                            أدخل التفاصيل
                                        </h2>
                                        <div class="relative">
                                            <label for="quantity" class="mt-6 block text-right text-gray-900 dark:text-white">
                                                الكمية
                                            </label>
                                            <input type="number" id="quantity"
                                                class="mt-4 w-full appearance-none rounded border p-2 leading-tight text-gray-900 shadow focus:outline-none"
                                                v-model="this.menu.quantity" v-bind:readonly="this.recentOrders.editPrintedInvoice === 1 && this.auth.removeTableOrderItem === 0"
                                            />
                                                <!-- :disabled="this.recentOrders.restaurantTable" -->
                                            <label for="comments" class="mt-6 block text-right text-gray-900 dark:text-white">
                                                الملاحظات
                                            </label>
                                            <input type="text" id="Comments"
                                                class="mt-4 w-full rounded border p-2 leading-tight text-gray-900 shadow focus:outline-none"
                                                v-model="this.menu.itemComments" />
                                        </div>
                                        <div class="flex justify-start">
                                            <button @click="this.menu.addToCartAndUpdateQty(item); this.menu.showDialog=false;"
                                                class="mt-8 rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600">
                                                إضافة
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else>
                            <div v-if="this.menu.items.length === 0" class="flex h-screen items-center justify-center">
                                <div class="text-center">
                                    لم يتم العثور على العناصر. الرجاء تحديد طاولة أو تعيين قائمة نشطة.
                                </div>
                            </div>
                            <div v-else class="flex h-screen items-center justify-center">
                                <div class="text-center">العناصر غير موجودة.</div>
                            </div>
                        </div>
                    </PerfectScrollbar>
                </div>
            </div>
            <div class="section-left border-r border-gray-300">
                <div class="grid grid-cols-5 gap-2 p-2 border-b border-gray-300">
                    <div class="relative col-span-3 z-30">
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center mx-2">
                            <svg
                                aria-hidden="true"
                                class="h-5 w-5 text-gray-500 dark:text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                ></path>
                            </svg>
                        </div>
                        <input
                            type="search"
                            placeholder="البحث عن زبون..."
                            class="w-full pr-10 px-2 py-1 border border-gray-300 rounded-md bg-gray-50 text-md font-medium text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                            required
                            v-model="this.customers.search"
                            @input="this.customers.handleSearchInput"
                            @click="this.customers.searchCustomer()"
                            :disabled="this.menu.selectedOrderType === 'Aggregators' || this.recentOrders.previousOrderdCustomer !== ''"
                        />
                        <div
                            v-if="this.customers.showCustomers && this.customers.showAddNewCustomer"
                            class="absolute z-20 p-2 mt-1 w-full max-h-64 overflow-y-auto bg-white border rounded-lg shadow-lg"
                            ref="dropdown"
                        >   
                            <div class="flex justify-end">
                                <span class="sr-only">إغلاق</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="mt-2 mr-2 h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    @click="this.customers.showAddNewCustomer = false"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                            <div
                                class="h-20 rounded-lg p-2 my-1 hover:bg-gray-100"
                                v-for="(customer, index) in this.customers.customer"
                                :key="index"
                                @click="this.customers.selectCustomer(customer)"
                            >
                                <h1 class="text-base font-semibold leading-normal">
                                    {{ customer.name }}
                                </h1>
                                <h2 class="text-sm leading-normal">
                                    {{ customer.name }}
                                    {{ customer.content ? this.customers.extractName(customer.content) : "" }}
                                </h2>
                            </div>
                            <div v-if="this.customers.showAddNewCustomer">
                                <a
                                    href="#"
                                    class="mt-1 lg:mt-0 inline-flex items-center text-blue-600 hover:underline"
                                    @click.prevent="this.customers.newCustomerData(this.customers.search)"
                                >
                                    <svg
                                        fill="none"
                                        stroke="currentColor"
                                        class="h-8 w-8 font-extrabold"
                                        viewBox="0 0 25 25"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M12 6v12m6-6H6"
                                        ></path>
                                    </svg>
                                    إضافة زبون جديد
                                </a>
                            </div>
                        </div>
                        <div
                            v-if="this.customers.showModalNewCustomer"
                            class="fixed inset-0 z-30 flex items-center justify-center bg-gray-900 bg-opacity-50"
                        >
                            <div
                                class="w-full max-w-lg bg-white rounded-lg shadow-lg p-6 relative"
                                style="height: 90vh; max-height: 600px;"
                            >
                            <button
                                @click="this.customers.showModalNewCustomer = false"
                                class="absolute top-3 left-3 text-gray-600 hover:text-gray-900"
                                aria-label="Close Modal"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                            
                            <h2 class="text-2xl font-bold text-gray-800 text-center">زبون جديد</h2>

                            <div class="mt-4">
                                <label
                                    for="newCustomer"
                                    class="block text-right text-gray-900 font-medium"
                                >
                                    اسم الزبون
                                </label>
                                <input
                                    type="text"
                                    id="newCustomer"
                                    class="mt-2 w-full p-2 border rounded-lg text-gray-900 focus:ring focus:ring-blue-300"
                                    v-model="this.customers.newCustomer"
                                />

                                <label
                                    for="mobileNumber"
                                    class="block mt-4 text-right text-gray-900 font-medium"
                                >
                                    رقم الموبايل
                                </label>
                                <input
                                    type="number"
                                    id="mobileNumber"
                                    class="mt-2 w-full p-2 border rounded-lg text-gray-900 focus:ring focus:ring-blue-300"
                                    v-model="this.customers.newCustomerMobileNo"
                                />
                                
                                <label
                                    for="customerGroup"
                                    class="block mt-4 text-right text-gray-900 font-medium"
                                >
                                    فئة الزبون
                                </label>
                                <input
                                    type="text"
                                    id="customerGroup"
                                    class="mt-2 w-full p-2 border rounded-lg text-gray-900 focus:ring focus:ring-blue-300"
                                    v-model="this.customers.customerGroup"
                                    @click="
                                        this.customers.showCustomersGroup = true;
                                        this.customers.pickCustomerGroup();
                                    "
                                />
                                <div
                                    v-if="this.customers.showCustomersGroup"
                                    class="absolute z-20 mt-1 w-full max-h-40 overflow-y-auto bg-white border rounded-lg shadow-lg"
                                >
                                    <div
                                        v-for="(group, index) in this.customers.customerGroupList"
                                        :key="index"
                                        class="p-2 hover:bg-gray-100 cursor-pointer"
                                        @click="this.customers.selectCustomerGroup(group)"
                                    >
                                        {{ group.name }}
                                    </div>
                                </div>
                                
                                <label
                                    for="territory"
                                    class="block mt-4 text-right text-gray-900 font-medium"
                                >
                                    الإقليم
                                </label>
                                <input
                                    type="text"
                                    id="territory"
                                    class="mt-2 w-full p-2 border rounded-lg text-gray-900 focus:ring focus:ring-blue-300"
                                    v-model="this.customers.customerTerritory"
                                    @click="
                                        this.customers.showCustomersTerritory = true;
                                        this.customers.pickCustomerTerritory();
                                    "
                                />
                                <div
                                    v-if="this.customers.showCustomersTerritory"
                                    class="absolute z-20 mt-1 w-full max-h-40 overflow-y-auto bg-white border rounded-lg shadow-lg"
                                >
                                    <div
                                        v-for="(territory, index) in this.customers.customerTerritoryList"
                                        :key="index"
                                        class="p-2 hover:bg-gray-100 cursor-pointer"
                                        @click="this.customers.selectCustomerTerritory(territory)"
                                    >
                                        {{ territory.name }}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mt-6 flex justify-end">
                                <button
                                    @click="this.customers.addNewCustomer()"
                                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring focus:ring-blue-300"
                                >
                                    حفظ
                                </button>
                            </div>
                            </div>
                        </div>
                    </div>
                    <div class="relative col-span-2 z-20">
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center mx-2">
                            <svg
                                class="h-6 w-6 text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                >
                                <path
                                    fill-rule="evenodd"
                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                    clip-rule="evenodd"
                                ></path>
                            </svg>
                        </div>
                        <input
                            type="number"
                            id="numberOfPax"
                            placeholder="عدد الأشخاص..."
                            required
                            v-model="this.customers.numberOfPax"
                            @input="this.customers.validateInput"
                            class="w-full pr-10 px-2 py-1 border border-gray-300 rounded-md bg-gray-50 text-md font-medium text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div class="grid grid-cols-12 gap-2 p-2 border-b border-gray-300 font-bold">
                    <div class="col-span-1 border-l">
                        #
                    </div>
                    <div class="col-span-3 border-l">
                        العنصر
                    </div>
                    <div class="col-span-2 border-l">
                        الكمية
                    </div>
                    <div class="col-span-2 border-l">
                        السعر
                    </div>
                    <div class="col-span-2 border-l">
                        الإجمالي
                    </div>
                    <div class="col-span-2">
                        خيارات
                    </div>
                </div>
                <div class="invoice-section">
                    <div class="invoice-scroll flex items-center justify-center" v-if="this.invoiceData.invoiceUpdating">
                        <div class="text-center">جارٍ تحديث الطلب...</div>
                    </div>
                    <div class="invoice-scroll flex items-center justify-center" v-if="this.menu.cart.length === 0">
                        <div class="text-center">لا توجد عناصر لعرضها.</div>
                    </div>
                    <PerfectScrollbar class="invoice-scroll overflow-hidden" :options="{ suppressScrollX: true }" v-if="this.menu.cart.length > 0">
                        <div
                            class="grid grid-cols-12 gap-2 p-2 border-b border-gray-300"
                            v-for="(cart_item, index) in this.menu.cart" :key="index"
                        >
                            <div class="col-span-1 border-l">
                                {{ index + 1 }}
                            </div>
                            <div class="item-name-cls col-span-3 border-l cursor-pointer" @click="this.menu.showModal(cart_item);">
                                {{ cart_item.item_name }}
                            </div>
                            <div class="col-span-2 border-l cursor-pointer" @click="this.menu.showModal(cart_item);">
                                {{ cart_item.qty }}
                            </div>
                            <div class="col-span-2 border-l">
                                {{ parseFloat(cart_item.rate).toFixed(2) }}
                            </div>
                            <div class="col-span-2 border-l">
                                {{ parseFloat(cart_item.qty * cart_item.rate).toFixed(2) }}
                            </div>
                            <div class="col-span-2 flex">
                                <button
                                    class="p-2 text-center"
                                    type="button"
                                    :disabled="this.recentOrders.restaurantTable"
                                    @click="(this.recentOrders.editPrintedInvoice === 0 || this.auth.removeTableOrderItem === 1) && this.menu.removeItemFromCart(index)"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                        :style="{ fill: this.menu.setColorForBilledInvoice }" class="bi bi-trash" viewBox="0 0 16 16">
                                        <path
                                            d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z">
                                        </path>
                                        <path
                                            d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z">
                                        </path>
                                    </svg>
                                </button>
                                <div class="p-2 text-center" v-if="cart_item.comment" :title="cart_item.comment">
                                    <svg class="h-6 w-6 text-gray-800"
                                        aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            d="M15 4h3c.6 0 1 .4 1 1v15c0 .6-.4 1-1 1H6a1 1 0 0 1-1-1V5c0-.6.4-1 1-1h3m0 3h6m-3 5h3m-6 0h0m3 4h3m-6 0h0m1-13v4h4V3h-4Z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </PerfectScrollbar>

                    <div class="buttons-section grid grid-cols-4 gap-2 p-1 bg-gray-100 border-t border-gray-300 shadow-md">
                        <div class="col-span-1 flex flex-col items-center justify-center bg-white p-1 rounded border border-gray-300">
                            <span class="text-sm text-gray-500">إجمالي الكمية</span>
                            <span class="text-md font-bold text-gray-700">{{ this.menu.total_qty || this.table.total_qty || this.invoiceData.total_qty }}</span>
                        </div>
                        <div class="col-span-1 flex flex-col items-center justify-center bg-white p-1 rounded border border-gray-300">
                            <span class="text-sm text-gray-500">المبلغ الإجمالي</span>
                            <span class="text-md font-bold text-gray-700">{{ this.menu.grand_total || this.table.grandTotal || this.invoiceData.grandTotal }} {{ this.invoiceData.currency }}</span>
                        </div>
                        
                        <div class="col-span-2 flex flex-col justify-center">
                            <!-- <label for="notes" class="text-sm text-gray-500 mb-1">الملاحظات</label> -->
                            <input
                                type="text"
                                id="notes"
                                class="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-blue-300"
                                placeholder="أدخل ملاحظات الطلب هنا..."
                                v-model="this.menu.comments"
                            >
                        </div>

                        <div class="col-span-2"  v-if="this.recentOrders.orderNumber === 'جديد' && (!this.table.invoiceNo && !invoiceData.invoiceNumber)">
                            <button
                                class="w-full py-3 text-white bg-blue-500 hover:bg-blue-600 rounded transition"
                                :disabled="this.menu.cart.length === 0"
                                :class="[this.menu.cart.length === 0 ? 'cursor-not-allowed' : '']"
                                @click="this.invoiceData.invoiceCreation()"
                                v-if="this.invoiceData.showUpdateButtton === true"
                            >
                                إضافة الطلب
                            </button>
                        </div>
                        <div class="col-span-2"  v-else>
                            <button
                                class="w-full py-3 text-white bg-yellow-500 hover:bg-yellow-600 rounded transition"
                                :disabled="this.menu.cart.length === 0"
                                :class="[this.menu.cart.length === 0 ? 'cursor-not-allowed' : '']"
                                @click="this.invoiceData.invoiceCreation()"
                                v-if="this.invoiceData.showUpdateButtton === true"
                            >
                                تحديث الطلب
                            </button>
                        </div>
                        <div
                            class="col-span-2"
                            v-if="(this.recentOrders.invoicePrinted === 0 || this.table.invoicePrinted === 0) && !this.auth.cashier"
                        >
                            <button
                                class="w-full py-3 text-white bg-red-500 hover:bg-red-600 rounded transition"
                                :disabled="this.menu.cart.length === 0"
                                :class="[this.menu.cart.length === 0 ? 'cursor-not-allowed' : '']"
                                @click="this.invoiceData.showCancelInvoiceModal()"
                            >
                                إلغاء الطلب
                            </button>
                        </div>
                    </div>
                    <div
                        v-if="this.invoiceData.cancelInvoiceFlag === true"
                        class="fixed inset-0 z-40 mt-20 overflow-y-auto bg-gray-100"
                    >
                        <div class="mt-20 flex items-center justify-center">
                            <div class="w-full rounded-lg bg-white p-6 shadow-lg md:max-w-md">
                                <div class="flex justify-end">
                                    <span class="sr-only">إغلاق</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="h-5 w-5 cursor-pointer"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        @click="this.invoiceData.cancelInvoiceFlag = false">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <h2 class="mt-1 block text-right text-xl font-medium text-gray-900 dark:text-white">
                                    هل أنت متأكد من إلغاء الطلب؟
                                </h2>
                                <div class="relative">
                                    <label
                                        for="cancelReason"
                                        class="mt-6 block text-right text-gray-900 dark:text-white"
                                    >
                                        السبب
                                    </label>
                                    <input
                                        type="text"
                                        id="cancelReason"
                                        placeholder="أدخل سبب إلغاء الطلب..."
                                        class="mt-4 w-full appearance-none rounded border p-2 leading-tight text-gray-900 shadow focus:outline-none"
                                        v-model="this.invoiceData.cancelReason"
                                    />
                                </div>
                                <div class="flex justify-between p-2 px-4">
                                    <button
                                        @click="this.invoiceData.cancelInvoice(); this.invoiceData.cancelInvoiceFlag = false;"
                                        class="mt-6 rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
                                    >
                                        نعم
                                    </button>
                                    <button @click="this.invoiceData.cancelInvoiceFlag = false"
                                        class="mt-6 rounded border border-gray-300 bg-gray-50 px-3 py-2">
                                        لا
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Search from "./Search.vue";
    import orderInfo from "./orderInfo.vue";
    import frappe from "@/stores/frappeSdk.js";
    import { useMenuStore } from "@/stores/Menu.js";
    import { useAuthStore } from "@/stores/Auth.js";
    import { usetoggleRecentOrder } from "@/stores/recentOrder.js";
    import { useInvoiceDataStore } from "@/stores/invoiceData.js";
    import { useCustomerStore } from "@/stores/Customer.js";
    import { useTableStore } from "@/stores/Table.js";


    export default {
        data() {
            return {
                frappe: frappe,
            };
        },
        setup() {
            const menu = useMenuStore();
            const auth = useAuthStore();
            const recentOrders = usetoggleRecentOrder();
            const invoiceData = useInvoiceDataStore();
            const customers = useCustomerStore();
            const table = useTableStore();

            return { menu, auth, recentOrders, invoiceData, customers, table };
        },
        name: "Menu",
        components: {
            Search,
            orderInfo,
        },
        mounted() {
            window.scrollTo(0, 0);
            if (!this.customers.search) {
                this.customers.search = this.table.default_customer;
            }
        },
    };
</script>
<style scoped>
    .main-container {
        height: calc(100vh - 130px);
        overflow: hidden;
        width: 100%;
    }

    .course-menu {
        position: fixed;
        top: 65px;
        bottom: 70px;
        right: 0;
        width: 200px;
        display: flex;
        flex-direction: column;
    }

    .course-menu > .ps {
        flex-grow: 1;
        overflow: hidden;
    }

    .course-menu button {
        white-space: normal;
        overflow-wrap: break-word;
        text-align: center;
        word-break: break-word;
        transition: all 0.3s ease-in-out;
    }

    .content-container {
        position: fixed;
        top: 65px;
        bottom: 65px;
        right: 200px;

        display: flex;
        width: calc(100% - 200px);
    }

    .section-left {
        position: relative;
        flex-grow: 5;
        flex-basis: 41.67%;
        overflow: hidden;
        height: 100%;
    }

    .section-right {
        position: relative;
        flex-grow: 7;
        flex-basis: 58.33%;
        overflow: hidden;
        height: 100%;
    }

    .invoice-section {
        position: absolute;
        top: 0;
        bottom: 65px;
        height: 100%;
        width: 100%;
    }

    .items-section {
        position: absolute;
        top: 0;
        bottom: 65px;
        height: 100%;
        width: 100%;
    }

    .invoice-scroll {
        position: absolute;
        top: 0;
        width: 100%;
        height: calc(80% - 100px);
        margin-top: 100px;
    }

    .items-scroll {
        position: absolute;
        top: 0;
        width: 100%;
        height: calc(100% - 50px);
        margin-top: 50px;
    }

    .buttons-section {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 20%;
    }

    .item-name-cls {
        white-space: normal;
        overflow-wrap: break-word;
        text-align: right;
        word-break: break-word;
    }
</style>