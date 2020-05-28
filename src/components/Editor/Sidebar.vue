<template>
    <b-card variant="dark" no-body class="sidebar_menu_card">
        <div class="sidebar_header">
            <p
                class="font-weight-light"
                style="padding: 5px 20px; font-size: 20px; color: white; text-align: center;"
            >rorEditor</p>
        </div>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
    name: "",
    components: {}
})
export default class SideBar extends Vue {}
</script>

<style lang="scss">
@use "~@/sass/var";

.sidebar_menu_card {
    height: 100%;
    min-height: 100vh;
    border: 0 !important;
    box-shadow: 5px 0px 5px rgba(0, 0, 0, 0.082);
    z-index: 10;
}

.sidebar_header {
    height: 40px;
    background-color: var.$primary;
    margin-bottom: 10px;
}
.hr_line {
    height: 5px;
    border-top: 3px solid;
    border-color: #381d46;
}

.card_body_sidebar_avatar {
    padding: 1.25rem;
    padding-bottom: 0.5rem;
}

.sidebar_avatar p {
    padding-left: 10px;
    display: inline-block;
}

.sidebar_nav {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
}
</style>
