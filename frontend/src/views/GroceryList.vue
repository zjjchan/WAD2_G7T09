<script setup>
    import Navbar from "@/components/Navbar.vue";
    import axios from 'axios';
    import { ref, onMounted } from "vue";
    import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, deleteField } from "firebase/firestore";
    import { getAuth, onAuthStateChanged } from "firebase/auth";
    import { db } from "../firebase";
    
    let isAddingItem = ref(false);
    let groceryList = ref([]);
    let itemAdded = ref();
    let quantityAdded = ref();
    let isEditingItem = ref(false);
    let editItemIndex = -1;
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

        groceryList.value = docSnap.data().itemlist;
    }

    async function addItem() {
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
            if (listData[i].itemname == itemAdded.value && editItemIndex == -1) {
                listData[i].quantity += quantityAdded.value;

                await updateDoc(doc(db, "grocerylist", uid), {
                    itemlist: listData
                });

                loadList();
                return null;
            }
        }

        if (editItemIndex == -1) {
            await updateDoc(doc(db, "grocerylist", uid), {
                itemlist: arrayUnion({itemname: itemAdded.value, quantity: quantityAdded.value, checked: "unchecked"})
            });
        } else {
            listData[editItemIndex].itemname = itemAdded.value;
            listData[editItemIndex].quantity = quantityAdded.value;

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

        console.log(listData);

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
    



</script>

<template>
    <Navbar />
    <div class="container-fluid">
        <div class="row">
            <div class="col-3"></div>
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
                                    <input type="text" aria-label="Item" class="form-control" v-model="itemAdded">
                                    <span class="input-group-text bg-dark-subtle">Quantity:</span>
                                    <input type="number" aria-label="Quantity" class="form-control" v-model="quantityAdded">
                                    <button v-if="isEditingItem" class="btn btn-warning" type="button" @click="addItem">Edit</button>
                                    <button v-else class="btn btn-success" type="button" @click="addItem">Add</button>
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
            <div class="col-3"></div>
        </div>
        <div class="row">
            <div class="col-3"></div>
            <div class="col d-flex justify-content-center">
                <button type="button" class="btn btn-primary">Generate a grocery list for me</button>
            </div>
            <div class="col-3"></div>
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

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
    }
</style>