<template>
  <orderInfo />
  <Search />
  <div class="container mx-auto grid lg:grid-cols-2 gap-5" v-if="this.menu.paginatedItems.length > 0">

    <div>
      <div class="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3">
        <div
          class="rounded border px-2 py-2 text-left shadow"
          v-for="item in this.menu.paginatedItems"
          :key="item.item"
        >
          <div class="w-100" v-if="this.auth.viewItemImage">
            <div v-if="item.item_imgae">
              <img
                :src="this.menu.getFullImagePath(item.item_imgae)"
                alt="Item Image"
                class="min-h-36 rounded"
              />
            </div>
            <div v-else class="relative">
              <img
                :src="`https://dummyimage.com/640x640/f9fafa/fff&text=+`"
                alt="Item Image"
                class="min-h-36 rounded"
              />
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-3xl text-gray-400">{{
                  this.menu.itemNameExtract(item.item_name)
                }}</span>
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
            {{ this.invoiceData.currency }} {{ item.rate }}
          </h2>
          <div v-if="!item.qty" class="text-center">
            <button
              @click="
                item.showInput = true;
                this.menu.addToCart(item);
              "
              class="rounded border px-10 pb-2 pt-2.5 text-xs font-medium leading-normal"
            >
              ADD +
            </button>
          </div>
          <div v-if="item.qty" class="flex rounded-md text-center">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 border bg-white px-4 py-3 align-middle text-sm font-medium shadow-sm transition-all focus:outline-none dark:border-gray-700"
              :class="{
                'text-gray-700':
                  this.recentOrders.editPrintedInvoice === 0 ||
                  this.auth.removeTableOrderItem === 1,
                'text-gray-300':
                  this.recentOrders.editPrintedInvoice === 1 ||
                  this.auth.removeTableOrderItem === 0,
              }"
              :disabled="this.recentOrders.restaurantTable"
              @click="
                (this.recentOrders.editPrintedInvoice === 0 ||
                  this.auth.removeTableOrderItem === 1) &&
                  this.menu.decrementItemQuantity(item)
              "
            >
              -
            </button>
            <input
              type="number"
              id="qty_input"
              name="qty_input"
              class="block w-full border border-gray-200 text-center text-sm shadow-sm"
              :value="item.qty"
              @input="item.qty = $event.target.value"
              readonly
              @click="this.menu.showModal(item)"
            />
            <button
              type="button"
              class="-ml-px inline-flex items-center justify-center gap-2 border bg-white px-4 py-3 align-middle text-sm font-medium text-gray-700 shadow-sm transition-all focus:outline-none dark:border-gray-700"
              @click="this.menu.incrementItemQuantity(item)"
            >
              +
            </button>
          </div>
        </div>
        <div
          v-if="menu.showDialog"
          class="fixed inset-0 z-10 mt-20 overflow-y-auto bg-gray-100"
        >
          <div class="mt-10 flex items-center justify-center">
            <div class="w-full rounded-lg bg-white p-6 shadow-lg md:max-w-md">
              <div class="flex justify-end">
                <span class="sr-only">Close</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  @click="menu.showDialog = false"
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
                class="mt-1 block text-left text-xl font-medium text-gray-900 dark:text-white"
              >
                Enter Details
              </h2>
              <div class="relative">
                <label
                  for="quantity"
                  class="mt-6 block text-left text-gray-900 dark:text-white"
                >
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  class="mt-4 w-full appearance-none rounded border p-2 leading-tight text-gray-900 shadow focus:outline-none"
                  v-model="this.menu.quantity"
                  v-bind:readonly="
                    this.recentOrders.editPrintedInvoice === 1 &&
                    this.auth.removeTableOrderItem === 0
                  "
                  :disabled="this.recentOrders.restaurantTable"
                />
                <label
                  for="comments"
                  class="mt-6 block text-left text-gray-900 dark:text-white"
                >
                  Comments
                </label>
                <input
                  type="text"
                  id="Comments"
                  class="mt-4 w-full rounded border p-2 leading-tight text-gray-900 shadow focus:outline-none"
                  v-model="this.menu.itemComments"
                />
              </div>
              <div class="flex justify-end">
                <button
                  @click="this.menu.addToCartAndUpdateQty(item)"
                  class="mt-8 rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    


    <div>
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-300 bg-opacity-50 text-lg" v-if="this.invoiceData.invoiceUpdating">
        Updating Order...
        </div>
        <div class="mt-5 flex">
        <div class="flex-grow">
          <orderInfo />
        </div>
        <div class="float-right rounded" v-if="this.menu.cart.length > 0">
          <button
            class="mr-4 rounded px-4 py-2 shadow"
            v-if="this.invoiceData.showUpdateButtton === true"
            @click="this.invoiceData.invoiceCreation()">
            Update
          </button>
          <!-- <button
            class="mr-4 rounded py-2 px-4 shadow"
            @click="this.invoiceData.kotReprint()">
            KOT Reprint
          </button> -->
          <button
            class="rounded px-4 py-2 shadow"
            v-if="
              (this.recentOrders.invoicePrinted === 0 ||
                this.table.invoicePrinted === 0) &&
              !this.auth.cashier
            "
            @click="this.invoiceData.showCancelInvoiceModal()"
          >
            Cancel
          </button>
        </div>
      </div>
      <div class="flex h-screen items-center justify-center" v-if="this.menu.cart.length === 0">
        <div class="text-center">Nothing to show here</div>
      </div>

      <div class="mt-5 border shadow" v-if="this.menu.cart.length > 0">
        <div
          class="cart-item-details grid w-full grid-cols-3 gap-4 md:w-full lg:w-full"
        >
          <h3
            class="ml-3 mt-2 text-base font-semibold text-gray-900 dark:text-white"
          >
            Item Name
          </h3>
          <h3
            class="ml-3 mt-2 text-center text-lg font-semibold text-gray-900 dark:text-white"
          >
            Quantity
          </h3>
        </div>
        <div
          class="cart-item-details ml-3 mt-2 grid w-full grid-cols-3 gap-4 pb-2 md:w-full lg:w-full"
          v-for="(cart_item, index) in this.menu.cart"
          :key="index"
        >
          <h3 class="w-full text-base text-gray-900 dark:text-white">
            {{ cart_item.item_name }}
          </h3>
          <input
            type="number"
            id="qty_input_cart"
            name="qty_input_cart"
            class="block w-full border-none text-center text-base text-gray-900 dark:text-white"
            :value="parseInt(cart_item.qty)"
            @input="cart_item.qty = $event.target.value"
            @click="
              this.menu.showModal(cart_item);
              menu.showDialogCart = true;
            "
            readonly
          />
          <div class="items-center text-center">
            <button
              class="p-2 text-center"
              type="button"
              :disabled="this.recentOrders.restaurantTable"            
              @click="
                (this.recentOrders.editPrintedInvoice === 0 ||
                  this.auth.removeTableOrderItem === 1) &&
                  this.menu.removeItemFromCart(index)
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                :style="{ fill: this.menu.setColorForBilledInvoice }"
                class="bi bi-trash"
                viewBox="0 0 16 16"
              >
                <path
                  d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"
                ></path>
                <path
                  d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div class="relative mt-8" v-if="this.menu.cart.length > 0">
        <label
          for="grand_total"
          class="mt-6 block text-left text-gray-900 dark:text-white"
        >
          Grand Total
        </label>
        <input
          class="grand_total mt-3 block w-full rounded-md border bg-gray-50 p-2.5 text-sm text-gray-900 md:w-3/5 lg:w-2/5"
          :value="
            this.menu.grand_total || this.table.grandTotal || invoiceData.grandTotal
          "
          readonly
        />
        <label
          for="aggregatorId"
          class="mt-6 block text-left text-gray-900 dark:text-white"
          v-if="this.menu.selectedOrderType === 'Aggregators'"
        >
          Aggregator ID
        </label>
        <input
          v-if="this.menu.selectedOrderType === 'Aggregators'"
          id="aggregatorId"
          class="mt-3 block w-full rounded-md border bg-gray-50 p-2.5 text-sm text-gray-900 md:w-3/5 lg:w-2/5"
          v-model="this.menu.aggregatorId"
        />
        <label
          for="Comments"
          class="mt-6 block text-left text-gray-900 dark:text-white"
        >
          Comments
        </label>
        <input
          id="comments"
          class="mt-3 block w-full rounded-md border bg-gray-50 p-2.5 text-sm text-gray-900 md:w-3/5 lg:w-2/5"
          v-model="this.menu.comments"
        />
      </div>

      <div v-if="this.invoiceData.cancelInvoiceFlag === true" class="fixed inset-0 z-10 mt-20 overflow-y-auto bg-gray-100">
        <div class="mt-20 flex items-center justify-center">
          <div class="w-full rounded-lg bg-white p-6 shadow-lg md:max-w-md">
            <div class="flex justify-end">
              <span class="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                @click="this.invoiceData.cancelInvoiceFlag = false"
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
              class="mt-1 block text-left text-xl font-medium text-gray-900 dark:text-white"
            >
              Are you sure to cancel
            </h2>
            <div class="relative">
              <label
                for="cancelReason"
                class="mt-6 block text-left text-gray-900 dark:text-white"
              >
                Reason
              </label>
              <input
                type="text"
                id="cancelReason"
                class="mt-4 w-full appearance-none rounded border p-2 leading-tight text-gray-900 shadow focus:outline-none"
                v-model="this.invoiceData.cancelReason"
              />
            </div>
            <div class="flex justify-end">
              <button
                @click="this.invoiceData.cancelInvoiceFlag = false"
                class="mr-3 mt-6 rounded border border-gray-300 bg-gray-50 px-3 py-2"
              >
                No
              </button>
              <button
                @click="
                  this.invoiceData.cancelInvoice();
                  this.invoiceData.cancelInvoiceFlag = false;
                "
                class="mt-6 rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="menu.showDialogCart" class="fixed inset-0 z-10 mt-20 overflow-y-auto bg-gray-100">
        <div class="mt-10 flex items-center justify-center">
          <div class="w-full rounded-lg bg-white p-6 shadow-lg md:max-w-md">
            <div class="flex justify-end">
              <span class="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                @click="menu.showDialogCart = false"
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
              class="mt-1 block text-left text-xl font-medium text-gray-900 dark:text-white"
            >
              Enter Details
            </h2>
            <div class="relative">
              <label
                for="quantity"
                class="mt-6 block text-left text-gray-900 dark:text-white"
              >
                Quantity
              </label>
              <input
                type="number"
                id="modeOfPayment"
                class="mt-4 w-full appearance-none rounded border p-2 leading-tight text-gray-900 shadow focus:outline-none"
                v-model="this.menu.quantity"
                v-bind:readonly="
                  this.recentOrders.editPrintedInvoice === 1 &&
                  this.auth.removeTableOrderItem === 0
                "
                :disabled="this.recentOrders.restaurantTable"
              />
              <label
                for="Comments"
                class="mt-6 block text-left text-gray-900 dark:text-white"
              >
                Comments
              </label>
              <input
                type="text"
                id="Comments"
                class="mt-4 w-full appearance-none rounded border p-2 leading-tight text-gray-900 shadow focus:outline-none"
                v-model="this.menu.itemComments"
              />
            </div>
            <div class="flex justify-end">
              <button
                @click="
                  this.menu.addToCartAndUpdateQty(item);
                  menu.showDialogCart = false;
                "
                class="mt-8 rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 w-full divide-y divide-gray-200 bg-white" v-if="this.menu.cart.length > 0">
        <details>
          <summary class="question w-full cursor-pointer select-none py-3">
            Additional Details
          </summary>
          <div class="additional-details m-3">
            <label
              for="invoiceNo"
              class="mt-10 block text-sm font-medium text-gray-900 dark:text-white"
              v-if="this.table.invoiceNo || invoiceData.invoiceNumber"
            >
              Invoice
            </label>
            <input
              class="invoiceNo mt-3 block w-full rounded-md border bg-gray-50 p-2.5 text-sm text-gray-900 md:w-3/5 lg:w-2/5"
              :value="this.table.invoiceNo || invoiceData.invoiceNumber"
              v-if="this.table.invoiceNo || invoiceData.invoiceNumber"
              readonly
            />
            <label
              for="waiter"
              class="mt-10 block text-sm font-medium text-gray-900 dark:text-white"
              :class="{ hidden: this.invoiceData.waiter === '' }"
            >
              Waiter
            </label>
            <input
              class="waiter mt-3 block w-full rounded-md border bg-gray-50 p-2.5 text-sm text-gray-900 md:w-3/5 lg:w-2/5"
              :class="{ hidden: this.invoiceData.waiter === '' }"
              :value="
                this.table.previousWaiter !== null &&
                this.table.previousWaiter !== undefined
                  ? this.table.previousWaiter
                  : this.recentOrders.recentWaiter !== null &&
                    this.recentOrders.recentWaiter !== undefined
                  ? this.recentOrders.recentWaiter
                  : this.invoiceData.waiter
              "
              readonly
            />
            <label
              for="posProfile"
              class="mt-10 block text-sm font-medium text-gray-900 dark:text-white"
              :class="{ hidden: this.invoiceData.posProfile === '' }"
            >
              POS Profile
            </label>
            <input
              class="posProfile mt-3 block w-full rounded-md border bg-gray-50 p-2.5 text-sm text-gray-900 md:w-3/5 lg:w-2/5"
              :class="{ hidden: this.invoiceData.posProfile === '' }"
              v-model="this.invoiceData.posProfile"
              readonly
            />
            <label
              for="cashier"
              class="mt-10 block text-sm font-medium text-gray-900 dark:text-white"
              :class="{ hidden: this.invoiceData.cashier === '' }"
            >
              Cashier
            </label>
            <input
              class="mt-3 block w-full rounded-md border bg-gray-50 p-2.5 text-sm text-gray-900 md:w-3/5 lg:w-2/5"
              :class="{ hidden: this.invoiceData.cashier === '' }"
              v-model="this.invoiceData.cashier"
              readonly
            />
          </div>
        </details>
      </div>
    </div>




  </div>
  <div v-else>
    <div
      v-if="this.menu.items.length === 0"
      class="flex h-screen items-center justify-center"
    >
      <div class="text-center">
        Items Not Found. Please select a table or set an active menu.
      </div>
    </div>
    <div v-else class="flex h-screen items-center justify-center">
      <div class="text-center">Items Not Found.</div>
    </div>
  </div>
  <div
    class="mt-4 flex justify-center"
    v-if="this.menu.paginatedItems.length > 0"
  >
    <button
      :class="{ hidden: this.menu.currentPage === 1 }"
      :disabled="this.menu.currentPage === 1"
      @click="this.menu.currentPage -= 1"
      class="mr-2 rounded-md border px-2 py-1"
    >
      Previous
    </button>
    <div v-for="pageNumber in this.menu.pageNumbers">
      <button
        v-if="
          pageNumber === this.menu.currentPage ||
          Math.abs(pageNumber - this.menu.currentPage) <= 2
        "
        :key="pageNumber"
        @click="this.menu.currentPage = pageNumber"
        :class="{ 'bg-gray-200': pageNumber === this.menu.currentPage }"
        class="mr-2 rounded-md border px-2 py-1"
      >
        {{ pageNumber }}
      </button>
      <span
        v-else-if="
          this.menu.pageNumbers.indexOf(pageNumber) === 0 ||
          this.menu.pageNumbers.indexOf(pageNumber) ===
            this.menu.pageNumbers.length - 1
        "
      >
        ...
      </span>
    </div>
    <button
      :disabled="this.menu.currentPage === this.menu.totalPages"
      @click="this.menu.currentPage += 1"
      :class="{ hidden: this.menu.currentPage === this.menu.totalPages }"
      class="rounded-md border px-2 py-1"
    >
      Next
    </button>
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
    const table = useTableStore();
    return { menu, auth, recentOrders,invoiceData, recentOrders, table };
  },
  name: "Menu",
  components: {
    Search,
    orderInfo,
  },
  mounted() {
    window.scrollTo(0, 0);
  },
};
</script>
<style>
.bg-gray-100 {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>