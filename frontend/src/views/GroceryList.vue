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

        const itemSnap = await getDoc(doc(db, "grocerylist", uid));
        const listData = itemSnap.data().itemlist;

        for (let i=0; i<listData.length; i++) {
            if (listData[i].itemname == itemAdded.value) {
                listData[i].quantity += quantityAdded.value;

                await updateDoc(doc(db, "grocerylist", uid), {
                    itemlist: listData
                });

                loadList();
                return null;
            }
        }

        await updateDoc(doc(db, "grocerylist", uid), {
            itemlist: arrayUnion({itemname: itemAdded.value, quantity: quantityAdded.value, checked: "unchecked"})
        });

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
                        </tr>
                    </thead>
                    <tbody>
                        <tr :class="i.checked" @click="checkItem(i.itemname)" @mouseenter="() => {if (i.checked == 'unchecked') {i.checked = 'checked'}}"
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
                        }" v-for="i in groceryList">
                            <td class="info" scope="row">{{ i.itemname }}</td>
                            <td class="info text-end">{{ i.quantity }}</td>
                            <td class="delete-item"><button type="button" class="btn-close" @click="removeItem(i.itemname)" aria-label="Delete"></button></td>
                        </tr>
                        <tr v-if="isAddingItem" class="add-item">
                            <td colspan="3">
                                <div class="input-group add-input">
                                    <span class="input-group-text bg-dark-subtle">Item:</span>
                                    <input type="text" aria-label="Item" class="form-control" v-model="itemAdded">
                                    <span class="input-group-text bg-dark-subtle">Quantity:</span>
                                    <input type="number" aria-label="Quantity" class="form-control" v-model="quantityAdded">
                                    <button class="btn btn-success" type="button" @click="addItem">Add</button>
                                    <button class="btn btn-danger" type="button" @click="cancelAddItem">Cancel</button>
                                </div>
                            </td>
                        </tr>
                        <tr v-else class="add-item">
                            <td colspan="3">
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

    tr.checked td {
        position: relative;
    }

    tr.checked td.info:before {
        content: " ";
        position: absolute;
        top: 50%;
        left: 0;
        border-bottom: 1px solid #111;
        width: 100%;
    }

    tr.checked td.info:after {
        content: "\00B7";
        font-size: 1px;
    }

    .delete-item {
        width: 0;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
    }
</style>