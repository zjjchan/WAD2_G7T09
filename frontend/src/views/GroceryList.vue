<script setup>
    import Navbar from "@/components/Navbar.vue";
    import axios from 'axios';
    import { ref, onMounted } from "vue";
    import { doc, setDoc, getDoc, updateDoc, arrayUnion, deleteField, deleteDoc } from "firebase/firestore";
    import { getAuth } from "firebase/auth";
    import { db } from "../firebase";
    import redirect from "@/assets/images/redirect.png";
    
    
    let isAddingItem = ref(false);
    let groceryList = ref([]);
    let itemAdded = ref();
    let quantityAdded = ref();
    let isEditingItem = ref(false);
    let amazonList = ref([]);
    let editItemIndex = -1;
    let isLoading = ref(false);
    const auth = getAuth();
    const user = auth.currentUser;

    onMounted(() => {
        loadList();
    })

    async function loadList() {
        if (!user) {
            alert("You need to sign in to see your grocery list.");
            return null;
        }

        const uid = user.uid;

        const docSnap = await getDoc(doc(db, "grocerylist", uid));

        if (!docSnap.exists()) {
            await setDoc(doc(db, "grocerylist", uid), {
                userid: uid,
                itemlist: []
            });
        }

        try {
            groceryList.value = docSnap.data().itemlist;
        } catch (error) {
            return;
        }
    }

    async function addItem(item, qty) {
        if (!user) {
            alert("You need to sign in to add items.");
            return null;
        }

        const uid = user.uid;

        if (isAddingItem.value) {
            isAddingItem.value = !isAddingItem.value;
        }

        if (isEditingItem.value) {
            isEditingItem.value = !isEditingItem.value;
        }

        const itemSnap = await getDoc(doc(db, "grocerylist", uid));
        const listData = itemSnap.data().itemlist;

        for (let i=0; i<listData.length; i++) {
            if (listData[i].itemname == item && editItemIndex == -1) {
                listData[i].quantity += qty;

                await updateDoc(doc(db, "grocerylist", uid), {
                    itemlist: listData
                });

                loadList();
                return null;
            }
        }

        if (editItemIndex == -1) {
            await updateDoc(doc(db, "grocerylist", uid), {
                itemlist: arrayUnion({itemname: item, quantity: qty, checked: "unchecked"})
            });
        } else {
            listData[editItemIndex].itemname = item;
            listData[editItemIndex].quantity = qty;

            await updateDoc(doc(db, "grocerylist", uid), {
                itemlist: listData
            });
        }

        editItemIndex = -1;
        loadList();
    }

    function showAddItem() {
        itemAdded.value = "";
        quantityAdded.value = "";

        if (!isAddingItem.value) {
            isAddingItem.value = !isAddingItem.value;
        }
    }

    function cancelAddItem() {
        if (isAddingItem.value) {
            isAddingItem.value = !isAddingItem.value;
        }

        if (isEditingItem.value) {
            isEditingItem.value = !isEditingItem.value;
        }

        editItemIndex = -1;
    }

    async function checkItem(item) {
        const uid = user.uid;
        const itemSnap = await getDoc(doc(db, "grocerylist", uid));
        const listData = itemSnap.data().itemlist;

        for (let i=0; i<listData.length; i++) {
            if (listData[i].itemname == item) {

                const itemChecked = listData[i].checked;

                if (itemChecked == "unchecked") {
                    listData[i].checked = "checked";
                } else {
                    listData[i].checked = "unchecked";
                }
            }
        }

        await updateDoc(doc(db, "grocerylist", uid), {
            itemlist: listData
        });

        loadList();
    }

    async function removeItem(item) {
        const uid = user.uid;
        const itemSnap = await getDoc(doc(db, "grocerylist", uid));
        const listData = itemSnap.data().itemlist;

        for (let i=0; i<listData.length; i++) {
            if (listData[i].itemname == item) {
                listData.splice(i, 1);
            }
        }

        await updateDoc(doc(db, "grocerylist", uid), {
            itemlist: deleteField()
        })
        await updateDoc(doc(db, "grocerylist", uid), {
            itemlist: listData
        });

        loadList();
    }

    function editItemProcess(item, qty, index) {
        if (!isEditingItem.value) {
            isEditingItem.value = !isEditingItem.value;
        }

        itemAdded.value = item;
        quantityAdded.value = qty;

        editItemIndex = index;

        if (!isAddingItem.value) {
            isAddingItem.value = !isAddingItem.value;
        }
    }

    async function generateList() {
        const uid = user.uid;
        await deleteDoc(doc(db, "grocerylist", uid));
        loadList();

        const appId = import.meta.env.VITE_EDAMAM_APP_ID;
        const apiKey = import.meta.env.VITE_EDAMAM_API_KEY;
        const docSnap = await getDoc(doc(db, "users", uid));
        const meals = docSnap.data().mealPlan;

        if (meals == null) {
            alert("You have no recipes added to your meal planner");
            return;
        } else {
            for (let day in meals) {
                for (let mealType in meals[day]) {
                    for (let m of meals[day][mealType]) {
                        let mealUri = m.uri.slice(0, m.uri.lastIndexOf("_"));
                        await axios.get(`https://api.edamam.com/search`, {
                            params: {
                                r: decodeURIComponent(mealUri),
                                app_id: appId,
                                app_key: apiKey,
                            },
                        })
                        .then(response => {
                            let ingrs = response.data[0].ingredients;
                            for (let ingr of ingrs) {
                                let qty = "";
                                let item = "";
                                if (ingr.measure == "<unit>") {
                                    qty = ingr.quantity;
                                } else {
                                    qty = 1;
                                }
                                item = ingr.food;

                                addItem(item, qty);
                            }
                        });
                    }
                }
            }
        }
    }

    async function loadAmazonListings() {
        const scraperKey = import.meta.env.VITE_SCRAPERAPI_KEY;
        amazonList.value = [];
        isLoading.value = true;

        try {
            for (let item of groceryList.value) {
                let para = {
                    api_key: scraperKey,
                    query: `${item.itemname} grocery`,
                    country: "sg",
                    tld: "sg",
                    page: 1
                }

                await axios.get(`https://api.scraperapi.com/structured/amazon/search?`, {params: para})
                .then(response => {
                    let listings = response.data.results;
                    for (let l of listings) {
                        if (l.position == 1) {
                            let name = l.name;
                            let image = l.image;
                            let price = l.price_string;
                            let asin = l.url.slice(8).split("/")[3];

                            amazonList.value.push([name, image, price, asin, item.quantity]);
                        }
                    }
                })
            }
        } catch (error) {
            alert("There was an error in getting the amazon listings. Please try again later.");
        } finally {
            isLoading.value = false;
        }
    }

    function redirectToAmazon() {
        if (groceryList.value.length == 0) {
            alert("There is nothing in your grocery list to add to cart!");
            return;
        }

        let urlString = "https://www.amazon.sg/gp/aws/cart/add.html?AssociateTag=your_tag&tag=your_tagQ"

        let counter = 1;

        for (let l of amazonList.value) {
            let temp = `&ASIN.${counter}=${l[3]}&Quantity.${counter}=${l[4]}`;
            urlString = urlString.concat(temp);

            counter++;
        }

        window.open(
            urlString,
            "_blank"
        );
    }


</script>

<template>
    <Navbar />
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-1"></div>
            <div class="col d-flex flex-column align-items-center">
                <h2>Grocery List</h2>
                <table class="table table-hover table-borderless">
                    <thead>
                        <tr class="table-success">
                        <th scope="col">Item</th>
                        <th class="text-end" scope="col">Quantity</th>
                        <th></th>
                        <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(i, index) in groceryList">
                            <td :class="i.checked" @click="checkItem(i.itemname)" @mouseenter="() => {if (i.checked == 'unchecked') {i.checked = 'checked'}}"
                            @mouseout="async () => {
                            const uid = user.uid;
                            const itemSnap = await getDoc(doc(db, 'grocerylist', uid));
                            const listData = itemSnap.data().itemlist;
                            for (let n=0; n<listData.length; n++) {
                                if (listData[n].itemname == i.itemname) {
                                    if (listData[n].checked == 'unchecked') {
                                        i.checked = 'unchecked';
                                    }
                                }
                            }
                        }" class="info" scope="row">{{ i.itemname }}</td>
                            <td :class="i.checked" @click="checkItem(i.itemname)" @mouseenter="() => {if (i.checked == 'unchecked') {i.checked = 'checked'}}"
                            @mouseout="async () => {
                            const uid = user.uid;
                            const itemSnap = await getDoc(doc(db, 'grocerylist', uid));
                            const listData = itemSnap.data().itemlist;
                            for (let n=0; n<listData.length; n++) {
                                if (listData[n].itemname == i.itemname) {
                                    if (listData[n].checked == 'unchecked') {
                                        i.checked = 'unchecked';
                                    }
                                }
                            }
                        }" class="info text-end">{{ i.quantity }}</td>
                            <td class="delete-item"><button type="button" class="btn-close" @click="removeItem(i.itemname)" aria-label="Delete"></button></td>
                            <td class="edit-item" @click="editItemProcess(i.itemname, i.quantity, index)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
  <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
</svg></td>
                        </tr>
                        <tr v-if="isAddingItem" class="add-item">
                            <td colspan="4">
                                <div class="input-group add-input">
                                    <span class="input-group-text bg-dark-subtle">Item:</span>
                                    <input type="text" aria-label="Item" class="form-control" style="width: 20%" v-model="itemAdded">
                                    <span class="input-group-text bg-dark-subtle">Qty:</span>
                                    <input type="number" aria-label="Quantity" class="form-control" v-model="quantityAdded">
                                    <button v-if="isEditingItem" class="btn btn-warning" type="button" @click="addItem(itemAdded, quantityAdded)">Edit</button>
                                    <button v-else class="btn btn-success" type="button" @click="addItem(itemAdded, quantityAdded)">Add</button>
                                    <button class="btn btn-danger" type="button" @click="cancelAddItem">Cancel</button>
                                </div>
                            </td>
                        </tr>
                        <tr v-else class="add-item">
                            <td colspan="4">
                                <div class="d-grid">
                                    <button class="btn btn-success" type="button" @click="showAddItem">+ add an item</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="col-md-1"></div>
        </div>
        <div class="row">
            <div class="col-md-1"></div>
            <div class="actions col d-flex justify-content-center">
                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#genRec">Generate a grocery list for me</button>
                <button type="button" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#checkout" @click="loadAmazonListings" :disabled="groceryList.length == 0">Add items to my Amazon Cart</button>
            </div>
            <div class="col-md-1"></div>
        </div>
        <div class="row" style="height: 50px"></div>
        <div class="modal fade" id="genRec" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="staticBackdropLabel">Generate grocery list</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        Doing this will <strong>delete your current grocery list</strong> and generate a new grocery list based on the meals in your weekly planner.<br>Do you wish to proceed and generate?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="generateList">Generate</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal fade" id="checkout" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="staticBackdropLabel">Add items to Amazon Cart</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div v-if="isLoading" class="modal-body">
                        Loading...
                    </div>
                    <div v-else class="modal-body">
                        <div v-for="list in amazonList" class="card mb-3" style="max-width: 540px;">
                            <div class="row g-0">
                                <div class="col-md-4">
                                <img :src=list[1] class="img-fluid rounded-start" alt="product img">
                                </div>
                                <div class="col-md-8">
                                    <div class="card-body">
                                        <h5 class="card-title">{{ list[0] }}</h5>
                                        <p class="card-text">Price: {{ list[2] }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <small class="text-body-secondary">Note that some items may not be available for order.</small>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-warning" data-bs-dismiss="modal" @click="redirectToAmazon" :disabled="isLoading">Take me to Amazon <img :src=redirect style="height: 18px; margin-bottom: 2px"></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    h2 {
        color: black;
        font-size: 26px;
    }

    .item-unchecked:hover > td {
        text-decoration: line-through;
    }

    .add-item:hover > td {
        box-shadow: none;
    }

    /* td.checked {
        text-decoration: line-through;
    } */

    td.checked {
        position: relative;
    }

    td.checked:before {
        content: " ";
        position: absolute;
        top: 50%;
        left: 0;
        border-bottom: 1px solid #111;
        width: 100%;
    }

    td.checked:after {
        content: "\00B7";
        font-size: 1px;
    }

    .delete-item {
        width: 0;
    }
    
    .edit-item {
        width: 0;
        color: rgb(106, 106, 106);
    }

    .edit-item:hover {
        color: black;
    }

    .actions button {
        margin: 0 3px;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
    }
</style>