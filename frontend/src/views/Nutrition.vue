<template>
    <Navbar />
    <div class="container-fluid">
        Nutrition
    </div>
    <br>
    <div>
        Show Days of the Week (Mon-Sun)
    </div>
    <br>
    <div>
        Show Meals eaten each day
    </div>
    <br>
    <div>
        <table>
            <tr>
                <th>Day</th>
                <th>Breakfast</th>
                <th>Lunch</th>
                <th>Dinner</th>
                <th>Supper</th>
            </tr>
            <tr>
                <td>Monday</td>
                <td>Oatmeal</td>
                <td>Grilled Chicken Salad</td>
                <td>Spaghetti</td>
                <td>Fruit Smoothie</td>
            </tr>
            <tr>
                <td>Tuesday</td>
                <td>Pancakes</td>
                <td>Turkey Sandwich</td>
                <td>Stir-fry Vegetables</td>
                <td>Nuts & Seeds</td>
            </tr>
            <tr>
                <td>Wednesday</td>
                <td>Scrambled Eggs</td>
                <td>Chicken Wrap</td>
                <td>Grilled Salmon</td>
                <td>Yogurt</td>
            </tr>
            <tr>
                <td>Thursday</td>
                <td>Smoothie Bowl</td>
                <td>Pasta Salad</td>
                <td>Beef Tacos</td>
                <td>Protein Bar</td>
            </tr>
            <tr>
                <td>Friday</td>
                <td>Avocado Toast</td>
                <td>Quinoa Bowl</td>
                <td>Pizza</td>
                <td>Dark Chocolate</td>
            </tr>
            <tr>
                <td>Saturday</td>
                <td>French Toast</td>
                <td>Caesar Salad</td>
                <td>Burgers</td>
                <td>Ice Cream</td>
            </tr>
            <tr>
                <td>Sunday</td>
                <td>Bagels</td>
                <td>Fish Tacos</td>
                <td>Roast Chicken</td>
                <td>Cheese & Crackers</td>
            </tr>
        </table>
    </div>
    <br>
    <div>
        Show Charts/Visuals of each meal eaten every day of the week
    </div>

</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
</script>

<style>
table,
th,
td {
    border: 1px black solid;
}
</style>