<template>
        <div class="grid grid-cols-1 lg:grid-cols-12 md:grid-cols-12 gap-2 border-b">
            <div
                :class="[
                    'relative p-2',
                    !this.auth.cashier ? 'lg:col-span-11 md:col-span-11' : 'lg:col-span-9 md:col-span-9'
                ]"
            >
                <!-- <label
                    for="room"
                    class="absolute right-4 -top-2 bg-white px-2 text-xs text-gray-600"
                >
                    حدد صالة أو جناح
                </label> -->
                <div
                    v-if="menu.selectedOrderTypeRequireTable()"
                    class="flex flex-wrap gap-4"
                >
                    <button
                        v-for="(room, index) in table.rooms"
                        :key="index"
                        @click="table.selectedRoom = room.name; table.handleRoomChange()"
                        :class="[
                            'px-4 py-2 rounded border text-gray-700 transition-colors duration-200',
                            table.selectedRoom === room.name ? 'bg-blue-700 text-white' : 'bg-gray-100 hover:bg-gray-200'
                        ]"
                    >
                        {{ room.name }}
                    </button>
                </div>
            </div>

            <!-- <div
                v-if="!this.auth.cashier"
                @click="this.table.toggleTableTypeSwitch"
                class="relative ml-1 mb-3 mt-2 inline-block h-10 w-28 cursor-pointer rounded bg-blue-700 lg:col-span-1 md:col-span-1"
            >
                <span
                    class="absolute w-full py-2 px-2 text-base text-white"
                    :class="this.table.tableTypeClass"
                >
                    {{ this.table.tableTypeLabel }}
                </span
                >
                <div
                    :style="{ transform: this.table.toggleTableType }"
                    class="absolute left-0 h-10 w-9 rounded border bg-white transition-transform duration-300 ease-in-out"
                >
                </div>
            </div> -->

            <div
                v-if="this.auth.cashier"
                class="grid justify-center items-start lg:col-span-3 md:col-span-3 p-2"
                :class="[this.menu.selectedOrderType === 'Aggregators' ? 'grid-cols-2' : 'grid-cols-1']"
            >
                <div class="relative ml-2">
                    <div class="relative">
                        <label
                            for="first"
                            class="absolute right-4 -top-1 z-10 bg-white px-2 text-xs text-gray-600"
                        >
                            نوع الطلب
                        </label>
                        <select
                            class="relative mt-2 w-full rounded border border-gray-300 bg-gray-50"
                            :class="{ 'my-2': this.auth.cashier }"
                            id="room"
                            v-model="menu.selectedOrderType"
                            @change="menu.orderTypeSelection()"
                            :disabled="recentOrders.pastOrderType !== null && recentOrders.pastOrderType !== ''"
                        >
                            <option
                                v-for="(type, index) in menu.orderType"
                                :key="index"
                                :value="type.name"
                            >
                                {{ type.label }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="relative" v-if="this.menu.selectedOrderType === 'Aggregators'">
                    <label
                        for="first"
                        class="absolute right-4 -top-1 z-10 bg-white px-2 text-xs text-gray-600"
                    >
                        قائمة {{ menu.orderTypeTranslations['Aggregators'] || 'Aggregators'}}
                    </label>
                    <select
                        class="relative mt-2 w-full rounded border border-gray-300 bg-gray-50"
                        id="room"
                        v-model="menu.selectedAggregator"
                        @change="menu.handleAggregatorChange"
                        :disabled="menu.cartHasValue || recentOrders.pastOrderType !== null && recentOrders.pastOrderType !== ''"
                    >
                        <option
                            v-for="(aggregator, index) in menu.aggregatorList"
                            :key="index"
                            :value="aggregator.customer"
                        >
                            {{ aggregator.customer }}
                        </option>
                    </select>
                </div>
            </div>
        </div>

        <!-- v-if="!this.table.isTakeaeay" -->
        <div
            v-if="menu.selectedOrderTypeRequireTable()"
            class="m-auto mt-1 py-1"
        >
            <div class="flow-root">
                <div
                    class="fixed inset-0 z-50 flex items-center justify-center bg-gray-300 bg-opacity-50 text-lg"
                    v-if="this.invoiceData.isPrinting"
                >
                    طباعة الفاتورة
                </div>
                <div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                    <div
                        w-full
                        class="w-full max-w-sm rounded border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800"
                        v-for="table in auth.cashier
                            ? this.table.filteredTables
                            : this.table.filteredTables"
                        :key="table.name"
                    >
                        <div class="flex justify-between">
                            <div class="flex justify-start px-2 pt-2">
                                <span
                                    class="me-2 rounded px-2.5 py-0.5 text-sm font-medium"
                                    :class="{
                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300':
                                        this.table.getBadgeType(table) === 'red',
                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300':
                                        this.table.getBadgeType(table) === 'default',

                                    'bg-yellow-100 text-yellow-800':
                                        this.table.getBadgeType(table) === 'yellow',
                                    'bg-green-100 text-green-800':
                                        this.table.getBadgeType(table) === 'green',
                                    }"
                                >
                                    {{ this.table.getBadgeText(table) }}
                                </span>
                            </div>
                            <div class="relative" v-if="table.occupied === 1">
                                <button
                                    class="inline-block rounded p-1.5 text-sm text-gray-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                                    type="button"
                                    @click="this.table.toggleDropdown(table.name)"
                                >
                                    <svg
                                    class="h-6 w-6"
                                    aria-hidden="true"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                    >
                                    <path
                                        d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"
                                    ></path>
                                    </svg>
                                </button>
                                <div
                                    class="absolute right-0 z-10 w-36 divide-y divide-gray-100 rounded bg-white shadow dark:bg-gray-700"
                                    v-show="this.table.activeDropdown === table.name"
                                >
                                    <ul class="py-2">
                                    <li>
                                        <a
                                        href="#"
                                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                                        @click="this.table.showModal = true; this.table.hideDropdown();"
                                        >تغيير الطاولة</a
                                        >
                                    </li>
                                    <li v-if="this.auth.hasAccess">
                                        <a
                                        href="#"
                                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                                        @click="this.table.showModalCaptainTransfer = true; this.table.hideDropdown();"
                                        >تغيير الكابتن</a
                                        >
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                                            @click="get_table_order_status(table.name, table.table_invoice); this.table.hideDropdown();"
                                        >
                                            عرض حالة الطلب
                                        </a>
                                    </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col pb-4">
                            <div
                                class="mt-1 text-center"
                                @click="
                                    table.occupied === 1 && !this.auth.restrictTableOrder
                                    ? this.table.routeToMenu(table)
                                    : ''
                                "
                            >
                                <h5
                                    class="mt-2 text-xl font-medium text-gray-900 dark:text-white"
                                    :class="{ 'mt-3': table.occupied === 0 }"
                                >
                                    {{ table.name }}
                                </h5>
                                <span class="text-sm text-gray-500 dark:text-gray-400">
                                    {{
                                    table.occupied === 1
                                        ? this.table.getTimeDifference(table)
                                        : ""
                                    }}</span
                                >
                            </div>
                            <div class="mt-8 text-center" v-if="table.occupied != 1">
                                <button
                                    type="button"
                                    class="inline-flex items-center rounded px-2 py-2.5 text-center text-sm font-medium text-white hover:bg-[#2557D6]/90 focus:outline-none focus:ring-4 focus:ring-[#2557D6]/50 dark:focus:ring-[#2557D6]/50"
                                    :class="[
                                    {
                                        'bg-blue-700': !this.auth.restrictTableOrder,
                                        'pointer-events-none bg-blue-400':
                                        this.auth.restrictTableOrder,
                                    },
                                    ]"
                                    @click="
                                    !this.auth.restrictTableOrder &&
                                        this.table.addToSelectedTables(table)
                                    "
                                >
                                    حجز طاولة  
                                    <svg
                                        class="mr-2 h-6 w-6 dark:text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                        transform="scale(-1, 1)"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                        ></path>
                                    </svg>
                                </button>
                            </div>
                            <div class="mt-2 flex justify-center" v-if="table.occupied === 1">
                                <button
                                    type="button"
                                    class="mb-2 me-2 inline-flex items-center rounded px-2 py-2.5 text-center text-sm font-medium text-white hover:bg-[#2557D6]/90 focus:outline-none focus:ring-4 focus:ring-[#2557D6]/50 dark:focus:ring-[#2557D6]/50"
                                    :class="[
                                        {
                                            'bg-blue-700': !this.auth.restrictTableOrder,
                                            'pointer-events-none bg-blue-400': this.auth.restrictTableOrder,
                                        },
                                    ]"
                                    @click="!this.auth.restrictTableOrder && this.invoiceData.confirm_order(invoice_name=table.table_invoice)"
                                    v-if="table.table_invoice && table.custom_is_confirmed === 0"
                                >
                                    تأكيد
                                    <svg
                                        class="svg-icon mr-2"
                                        viewBox="0 0 24 24"
                                        width="18"
                                        height="18"
                                        fill="white"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M 12 24 C 5.372 24 0 18.628 0 12 C 0 5.372 5.372 0 12 0 c 6.628 0 12 5.372 12 12 C 24 18.628 18.628 24 12 24 z M 12 1.87 C 6.177 1.87 1.87 6.177 1.87 12 S 6.177 22.13 12 22.13 S 22.13 17.823 22.13 12 S 17.823 1.87 12 1.87 z"
                                        />
                                        <path
                                            d="M 11.31 16.553 c -0.509 0 -0.994 -0.222 -1.325 -0.609 L 5.31 8.746 c -0.627 -0.732 -0.543 -1.835 0.189 -2.462 c 0.731 -0.626 1.834 -0.544 2.462 0.188 l 4.057 4.858 l 5.223 -6.48 c 0.621 -0.769 1.746 -0.889 2.517 -0.271 c 0.771 0.621 0.889 1.746 0.271 2.517 l -5.882 7.301 c -0.305 0.379 -0.763 0.602 -1.248 0.61 C 11.323 16.553 11.316 16.553 11.31 16.553 z"
                                        />
                                    </svg>
                                </button>

                                <button
                                    type="button"
                                    class="mb-2 me-2 inline-flex items-center rounded px-2 py-2.5 text-center text-sm font-medium text-white hover:bg-[#2557D6]/90 focus:outline-none focus:ring-4 focus:ring-[#2557D6]/50 dark:focus:ring-[#2557D6]/50"
                                    :class="[
                                        {
                                            'bg-blue-700': !this.auth.restrictTableOrder,
                                            'pointer-events-none bg-blue-400': this.auth.restrictTableOrder,
                                        },
                                    ]"
                                    @click="this.invoiceData.billing(table)"
                                    v-else-if="!(table.table_invoice && table.custom_is_confirmed === 0)"
                                >
                                    تفريغ الطاولة
                                    <svg
                                        class="svg-icon mr-2"
                                        viewBox="0 0 24 24"
                                        width="18"
                                        height="18"
                                        fill="white"
                                    >
                                        <path
                                            d="M6 19H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2zm0-2v-1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1h2V9H4v8h2zM8 4v3h8V4H8zm0 13v3h8v-3H8zm-3-7h3v2H5v-2z"
                                        />
                                    </svg>
                                </button>

                                <div
                                    class="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800"
                                    :class="[
                                    {
                                        'border-blue-700 text-blue-700':
                                        !this.auth.restrictTableOrder,
                                        'pointer-events-none border-blue-400 text-blue-400':
                                        this.auth.restrictTableOrder,
                                    },
                                    ]"
                                    @click="!this.auth.restrictTableOrder && this.table.routeToMenu(table)"
                                >
                                    <svg
                                    aria-hidden="true"
                                    class="h-10 w-6"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                    >
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                                    <path
                                        fill-rule="evenodd"
                                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                        clip-rule="evenodd"
                                    ></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                v-if="this.table.tables.length === 0"
                class="inset-0 mt-72 flex items-center justify-center"
            >
                <div class="text-center">
                    لم يتم العثور على طاولات. الرجاء تعيين طاولات للجناح
                    <span class="font-medium">{{ this.table.selectedRoom }}.</span>
                </div>
            </div>
        </div>
        <!-- <div v-else>
            <takeAwayTable />
        </div> -->

        <div
            v-if="table.showModal"
            class="fixed inset-0 z-10 overflow-y-auto bg-gray-100"
        >
            <div class="mt-20 flex items-center justify-center">
            <div class="mt-10 w-full rounded bg-white p-6 shadow-lg md:max-w-md">
                <div class="flex justify-end">
                <span class="sr-only">Close</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    @click="this.table.showModal = false"
                >
                    <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
                </div>

                <h2
                class="mt-1 block text-right text-xl font-medium text-gray-900 dark:text-white"
                >
                تغيير الطاولة
                </h2>
                <div class="relative" ref="container">
                <label
                    for="newTable"
                    class="mt-6 block text-right text-gray-900 dark:text-white"
                >
                    الطاولة الجديدة
                </label>
                <input
                    type="text"
                    class="mt-4 w-full appearance-none rounded border p-2 leading-tight text-gray-900 shadow focus:outline-none"
                    v-model="table.newTable"
                    @click="
                    this.table.showTable = true;
                    this.table.tableSearch();
                    "
                />
                <div
                    v-if="this.table.showTable"
                    class="absolute left-0 top-full z-10 max-h-64 w-full overflow-y-scroll rounded bg-white shadow"
                    ref="dropdown"
                >
                    <div
                    class="h-16 w-full rounded p-4 hover:bg-gray-100"
                    v-for="(tables, index) in this.table.searchTable"
                    :key="index"
                    @click="this.table.selectTable(tables)"
                    >
                    <h1 class="text-base font-semibold leading-normal">
                        {{ tables.name }}
                    </h1>
                    </div>
                </div>
                </div>
                <label
                for="newTable"
                class="mt-6 block text-right text-gray-900 dark:text-white"
                >
                الطاولة الحالية
                </label>
                <input
                type="text"
                id="newTable"
                class="mt-4 w-full appearance-none rounded border p-2 leading-tight text-gray-900 shadow focus:outline-none"
                :value="table.tableName"
                readonly
                />
                <div class="flex justify-start">
                <button
                    @click="
                    this.table.showModal = false;
                    this.table.tableTransfer(table);
                    "
                    class="mt-8 rounded bg-blue-700 px-3 py-2 text-white hover:bg-blue-600"
                >
                    تغيير
                </button>
                </div>
            </div>
            </div>
        </div>

        <div
            v-if="table.showModalCaptainTransfer"
            class="fixed inset-0 z-10 overflow-y-auto bg-gray-100"
        >
            <div class="mt-20 flex items-center justify-center">
            <div class="mt-10 w-full rounded bg-white p-6 shadow-lg md:max-w-md">
                <div class="flex justify-end">
                <span class="sr-only">Close</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    @click="table.showModalCaptainTransfer = false"
                >
                    <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
                </div>
                <h2
                class="mt-1 block text-right text-xl font-medium text-gray-900 dark:text-white"
                >
                تغيير الكابتن
                </h2>
                <div class="relative" ref="container">
                <label
                    for="newTable"
                    class="mt-6 block text-right text-gray-900 dark:text-white"
                >
                    الكابتن الجديد
                </label>
                <input
                    type="text"
                    class="mt-4 w-full appearance-none rounded border p-2 leading-tight text-gray-900 shadow focus:outline-none"
                    @click="
                    this.table.showCaptain = true;
                    this.table.fetchCaptain();
                    "
                    v-model="this.table.newCaptain"
                />
                <div
                    v-if="this.table.showCaptain"
                    class="absolute left-0 top-full z-10 max-h-64 w-full overflow-y-scroll rounded bg-white shadow"
                    ref="dropdown"
                >
                    <div
                    class="h-16 w-full rounded p-4 hover:bg-gray-100"
                    v-for="(captain, index) in this.table.searchCaptian"
                    :key="index"
                    @click="this.table.selectcaptain(captain)"
                    >
                    <h1 class="text-base font-semibold leading-normal">
                        {{ captain.name }}
                    </h1>
                    </div>
                </div>
                </div>
                <label
                for="newTable"
                class="mt-6 block text-right text-gray-900 dark:text-white"
                >
                الكابتن الحالي
                </label>
                <input
                type="text"
                id="newTable"
                class="mt-4 w-full appearance-none rounded border p-2 leading-tight text-gray-900 shadow focus:outline-none"
                :value="this.table.currentCaptain"
                readonly
                />
                <div class="flex justify-start">
                <button
                    @click="
                    this.table.showModalCaptainTransfer = false;
                    this.table.captianTransfer();
                    "
                    class="mt-8 rounded bg-blue-700 px-3 py-2 text-white hover:bg-blue-600"
                >
                    تغيير
                </button>
                </div>
            </div>
            </div>
        </div>

        <div
            v-if="showModal"
            class="status_modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            @click.self="closeModal()"
        >
            <div
                class="w-11/12 max-w-4xl rounded-lg bg-white p-5 shadow-lg dark:bg-gray-800"
                style="max-height: 80vh; overflow: hidden;"
            >
                <h2 class="mb-1 text-xl font-semibold text-gray-900 dark:text-gray-200">
                    تفاصيل الطلبات للطاولة {{ currentTable }}
                </h2>
                
                <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    عرض حالة الطلبات المرتبطة بهذه الطاولة.
                </p>
                
                <PerfectScrollbar
                    class="overflow-hidden"
                    style="max-height: 60vh; overflow-y: auto;"
                    :options="{ suppressScrollX: true }"
                >
                    <div v-for="(order, index) in orderStatus" :key="order.order_id" class="mb-4 p-4 border rounded-lg bg-gray-100 dark:bg-gray-700">
                        <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200">
                            رقم الطلب: {{ order.order_id }}
                        </h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            الطاولة: {{ order.table }} | الفاتورة: {{ order.invoice }}
                        </p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            الحالة: {{ $t(order.order_status) }} | نوع الطلب: {{ order.type }}
                        </p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            الوقت المنقضي: {{ order.elapsed_time }} دقيقة |  الوقت المتبقي: {{ order.remaining_time }} دقيقة
                        </p>
                        <div>
                            <h4 class="mt-2 text-md font-semibold text-gray-700 dark:text-gray-300">
                                العناصر:
                            </h4>
                            <ul>
                                <li v-for="(item, i) in order.items" :key="i" class="text-sm text-gray-800 dark:text-gray-200">
                                    - {{ item.item_name }}: {{ item.quantity }} (زمن التحضير: {{ item.preparation_time }} دقيقة) <span class="text-green-700" v-if="item.is_ready">-> جاهز</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </PerfectScrollbar>

                <div class="flex justify-end space-x-2 my-2">
                    <button
                        @click="closeModal"
                        class="rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
</template>

<script>
import { useTableStore } from "@/stores/Table.js";
import { useAuthStore } from "@/stores/Auth.js";
import { useMenuStore } from "@/stores/Menu.js";
import takeAwayTable from "./takeAwayTable.vue";
import { usetoggleRecentOrder } from "@/stores/recentOrder.js";
import { useInvoiceDataStore } from "@/stores/invoiceData.js";

export default {
    name: "Table",
    components: {
        takeAwayTable,
    },
    data() {
        return {
            showModal: false,
            currentTable: "",
            orderStatus: null,
        }
    },
    setup() {
        const table = useTableStore();
        const invoiceData = useInvoiceDataStore();
        const auth = useAuthStore();
        const menu = useMenuStore();
        const recentOrders = usetoggleRecentOrder();
        
        return {
            table,
            invoiceData,
            auth,
            menu,
            recentOrders,
        };
    },
    methods: {
        async get_table_order_status(table_name, invoice_name) {
            try {
                const args = {
                    table: table_name,
                    invoice: invoice_name,
                };
    
                const response = await this.auth.call.get("ury.ury_pos.api.get_order_status", args);
                
                const data = response;
                this.orderStatus = data.message;
                this.currentTable = table_name;
                this.showModal = true;
            } catch (error) {
                console.error("Error fetching order status:", error);
            }
        },
        closeModal() {
            this.showModal = false;
            this.currentTable = "";
            this.orderStatus = null;
        },
    },
};
</script>

<style scoped>
.status_modal {
    z-index: 9999;
}
</style>
