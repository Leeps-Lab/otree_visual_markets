import { html, PolymerElement } from '/static/otree-redwood/node_modules/@polymer/polymer/polymer-element.js';
import '/static/otree-redwood/node_modules/@polymer/polymer/lib/elements/dom-if.js';
import '/static/otree-redwood/src/redwood-channel/redwood-channel.js';
import '/static/otree-redwood/src/otree-constants/otree-constants.js';

import '/static/otree_markets/trader_state.js'
import '/static/otree_markets/simple_modal.js';
import '/static/otree_markets/event_log.js';

import './heatmap_element.js';
import './currency_scaler.js';
import './filtered_order_list.js';
import './filtered_trade_list.js';

class VisualMarkets extends PolymerElement {

    static get properties() {
        return {
            utilityFunctionString: String,
            utilityFunction: {
                type: Object,
                computed: 'computeUtilityFunction(utilityFunctionString)',
            },
            maxUtility: Number,
            xBounds: Array,
            yBounds: Array,
            bids: Array,
            asks: Array,
            trades: Array,
            settledX: Number,
            availableX: Number,
            settledY: Number,
            availableY: Number,
            proposedX: Number,
            proposedY: Number,
            heatmapEnabled: Boolean,
            showNBestOrders: Number,
            showNMostRecentTrades: Number,
            showOwnTradesOnly: Boolean,
        };
    }

    // override attribute deseralization to make the way booleans work a little more intuitive
    // change it so that a nonexistent attribute or an attribute of "false" deserializes to false
    // and everything else deserializes to true. this makes passing booleans in from the template a lot easier.
    _deserializeValue(value, type) {
        if (type == Boolean) {
            return !(!value || value.toLowerCase() == 'false');
        }
        return super._deserializeValue(value, type);
    }

    static get template() {
        return html`
            <style>
                * {
                    box-sizing: border-box;
                }
                h3 {
                    font-size: 16px;
                    letter-spacing: 2px;
                    word-spacing: 2px;
                    color: #FAFAFA;
                    font-weight: bold;
                    text-decoration: none;
                    font-style: normal;
                    font-variant: normal;
                    margin-left: 10px;
                    text-transform: none;
                }
                .full-width {
                    width: 100vw;
                    margin-left: 50%;
                    transform: translateX(-50%);
                }
                .flex-fill {
                    flex: 1 0 0;
                    min-height: 0;
                }

                .main-container {
                    display: flex;
                    justify-content: space-evenly;
                    padding: 10px;
                    height: 80vh;
                }
                .left-side {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }
                .list-container {
                    display: flex;
                    flex: 1;
                    justify-content: center;
                }
                .list-cell {
                    flex: 1 0 40px;
                    max-width: 250px;
                    margin: 10px;
                    display: flex;
                    flex-direction: column;
                }
                .info-table {
                    display:table;
                    margin: auto;
                    text-align: center;
                    border-radius: 5px;
                    width: 40%;
                    border: 2px solid black;
                    align-items:center;
                }
                .Title
                {
                    border: 2px solid black;
                    background-color: black;
                    color:white;
                    text-align: center;
                    font-weight: bold;
                }
                .Heading
                {
                    display: table-row;
                    font-weight: bold;
                    text-align: center;
                }
                .Row
                {
                    display: table-row;
                    text-align:center;
                }
                .Cell
                {
                    display: table-cell;
                    border: solid;
                    border-width: thin;
                    padding-left: 5px;
                    padding-right: 5px;
                }
                .heatmap-cell {
                    display: flex;
                    align-items: center;
                    flex: 1;
                    max-width: 80vh;
                    padding: 10px 10px 0 0;
                }

                filtered-order-list, filtered-trade-list, heatmap-element {
                    border-radius: 5px;
                    border: 1px solid black;
                    margin-top:10px;
                    margin-bottom:10px;
                    margin-left:10px;
                    margin-right:10px;
                }


                /* these css rules make an element square, based on its width */
                .square-aspect {
                    height: 0;
                    width: 100%;
                    padding-top: 100%;
                    position: relative;
                }
                .square-aspect > * {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }

                .pricevolumeinput{ 
                    text-align: center;
                    margin: 10px;  
                    display: table;
                    border-radius: 2px;
                    border: 1px solid grey;
                    justify-content: center;
                    align-items: center;                
                }

                .infoboxcell{
                    text-align: center;
                    margin: auto;  
                    width:100%;
                    display: table;
                    border-radius: 2px;
                    border: 1px solid grey;
                    justify-content: center;
                    align-items: center;     
                }
                .infoboxrow{
                    margin-left: 10px;
                    margin-right: 10px;
                    text-align: center;
                    width:100%;
                    display: table;
                    border-radius: 2px;
                    border: 1px solid grey;
                    justify-content: center;
                    align-items: center;     
                }

                label{
                    margin:auto;
                    padding:2px;
                    // border-radius:5px;
                    border-right: 1px solid grey;
                    border-left: 1px solid white;
                    border:1;
                    -webkit-box-shadow: inset 3px 3px 25px 35px #EBEBEB; 
                    box-shadow: inset 3px 3px 25px 35px #EBEBEB;
                    display: table-cell;
                }
                span {
                    display: table-cell;
                    padding: 0 0 0 5px
                }

                input[type=number] {
                    margin:auto;
                    background-color: transparent;
                    border: 0px solid;
                    width: 90%;
                    height: 30px;
                  }

                button{
                    margin: auto;
                    color: #fff !important;
                    text-transform: uppercase;
                    text-decoration: none;
                    
                    padding: 6px;
                    border-radius: 5px;
                    display: flex;
                    border: none;
                    transition: all 0.4s ease 0s;
                }

                
                button:hover{
                    text-shadow: 0px 0px 6px rgba(255, 255, 255, 1);
                    box-shadow: 0px 5px 40px -10px rgba(0,0,0,0.57);
                    transition: all 0.4s ease 0s;
                }

                .form-group{
                    width: auto;
                    padding: 20px;
                    float: left;
                  }
                
                


            </style>

            <currency-scaler
                id="currency_scaler"
            ></currency-scaler>
            <simple-modal
                id="modal"
            ></simple-modal>
            <otree-constants
                id="constants"
            ></otree-constants>
            <trader-state
                id="trader_state"
                bids="{{bids}}"
                asks="{{asks}}"
                trades="{{trades}}"
                settled-assets="{{settledX}}"
                available-assets="{{availableX}}"
                settled-cash="{{settledY}}"
                available-cash="{{availableY}}"
            ></trader-state>

            <div class="full-width">
                <div class="main-container">
                    <div class="left-side">
                        <div class="list-container">
                            <div class="list-cell" style= "border-radius: 5px;border: 2px solid red;">
                                <div class="Title" style= "background-color: red;">
                                    <h3>Bids</h3>
                                </div>
                                <filtered-order-list
                                    border: center;
                                    class="flex-fill"
                                    orders="[[bids]]"
                                    on-order-canceled="_order_canceled"
                                    on-order-accepted="_order_accepted"
                                    display-format="[[orderFormat]]"
                                    limit-num="[[showNBestOrders]]"
                                ></filtered-order-list>
                                <div style="margin:auto;">
                                    <div on-input="_updateProposedBundleBid">
                                        <div class ="pricevolumeinput" style="width: 90%;
                                        height: 30;">
                                            <label for="bid_price_input">Price: </label>
                                            <input id="bid_price_input" type="number" min="0" >
                                        </div>
                                        <div class ="pricevolumeinput" style="width:90%">
                                            <label for="bid_volume_input">Qty: </label>
                                            <input id="bid_volume_input" type="number" min="1" >
                                        </div>
                                    </div>
                                    <div>
                                        <button type="button" on-click="_enter_bid" style = "background: #E01936;" >Bid</button>
                                    </div>
                                </div>
                            </div>
                            <div class="list-cell" style= "border-radius: 5px;border: 2px solid grey; 
                            outline-offset: 0px;">
                                <div class="Title" style= "background-color: grey;">
                                    <h3>Trades</h3>
                                </div>
                                <filtered-trade-list
                                    class="flex-fill"
                                    trades="[[trades]]"
                                    display-format="[[tradeFormat]]"
                                    limit-num="[[showNMostRecentTrades]]"
                                    show-own-only="[[showOwnTradesOnly]]"
                                ></filtered-trade-list>
                            </div>
                            <div class="list-cell" style= "border-radius: 5px;border: 2px solid green; 
                            outline-offset: 0px;">
                                <div class="Title" style= "background-color: green;">
                                    <h3>Asks</h3>
                                </div>
                                <filtered-order-list
                                    class="flex-fill"
                                    orders="[[asks]]"
                                    on-order-canceled="_order_canceled"
                                    on-order-accepted="_order_accepted"
                                    display-format="[[orderFormat]]"
                                    limit-num="[[showNBestOrders]]"
                                ></filtered-order-list>
                                <div style="margin:auto;">
                                    <div on-input="_updateProposedBundleAsk">
                                    <div class ="pricevolumeinput" style="width: 90%;
                                    height: 30;">
                                            <label for="ask_price_input">Price: </label>
                                            <input id="ask_price_input" type="number" min="0">
                                        </div>
                                        <div class ="pricevolumeinput" style="width:90%">
                                            <label for="ask_volume_input">Qty: </label>
                                            <input id="ask_volume_input" type="number" min="1">
                                        </div>
                                    </div>
                                    <div>
                                        <button type="button" on-click="_enter_ask" style = "background: #09C206;">Ask</button>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div class="info-table">
                            <div class ="Title">Your Allocation</div>

                            <div class ="infoboxcell">
                                <div class="Heading">
                                    <label for="[[ xToHumanReadable(settledX) ]]">X:</label>
                                    <span>[[ xToHumanReadable(settledX) ]]</span>
                                </div>
                            </div>

                            <div class="infoboxcell">
                                <div class="Heading">
                                    <label for="[[ yToHumanReadable(settledY) ]]">Y:</label>
                                    <span>[[ yToHumanReadable(settledY) ]]</span>
                                </div>
                            </div>

                            <div class="infoboxcell">
                                <div class="Heading">
                                    <label for="[[ displayUtilityFunction(settledX, settledY) ]]">Utility: </label>
                                    <span>[[ displayUtilityFunction(settledX, settledY) ]]</span>
                                </div>
                            </div>
                        </div>

                    </div>
                    <template is="dom-if" if="{{ heatmapEnabled }}">
                        <div class="heatmap-cell">
                            <div class="square-aspect">
                                <heatmap-element
                                    id="heatmap"
                                    utility-function="[[ utilityFunction ]]"
                                    x-bounds="[[ xBounds ]]"
                                    y-bounds="[[ yBounds ]]"
                                    current-x="[[ settledX ]]"
                                    current-y="[[ settledY ]]"
                                    max-utility="[[ maxUtility ]]"
                                    proposed-x="[[ proposedX ]]"
                                    proposed-y="[[ proposedY ]]"
                                    on-heatmap-click="onHeatmapClick"
                                ></heatmap-element>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        `;
    }

    ready() {
        super.ready();
        this.pcode = this.$.constants.participantCode;

        this.orderFormat = order => {
            const price = this.$.currency_scaler.yToHumanReadable(order.price);
            const volume = this.$.currency_scaler.xToHumanReadable(order.volume);
            return `${volume} @ $${price}`;
        };
        this.tradeFormat = (making_order, taking_order) => {
            const price = this.$.currency_scaler.yToHumanReadable(making_order.price);
            const volume = this.$.currency_scaler.xToHumanReadable(making_order.traded_volume);
            return `${volume} @ $${price}`;
        };
    }
    
    computeUtilityFunction(utilityFunctionString) {
        const unscaled_utility = new Function('x', 'y', 'return ' + utilityFunctionString);
        return (x, y) => {
            return unscaled_utility(
                this.$.currency_scaler.xToHumanReadable(x),
                this.$.currency_scaler.yToHumanReadable(y)
            );
        }
    }

    onHeatmapClick(e) {
        // this takes some explanation..
        // we need it to be actually possible to move from the current bundle to the proposed one.
        // the restriction is that order prices and volumes have to be integers.
        // so when we calculate the proposed Y, we actually calculate the nearest Y to the click
        // which is an integer multiple of the difference in X between the current X and the proposed X.
        const proposedX = e.detail.x;
        if (proposedX == this.settledX)
            return;

        const xDist = proposedX - this.settledX;
        const proposedY = this.settledY + xDist * Math.round((e.detail.y - this.settledY) / xDist);
        if (proposedY == this.settledY)
            return;

        // if the calculated proposed bundle is in either of the 'impossible' quadrants, just return
        if ((proposedX > this.settledX && proposedY > this.settledY) || (proposedX < this.settledX && proposedY < this.settledY))
            return;

        this.setProperties({
            proposedX: proposedX,
            proposedY: proposedY,
        });

        // calculate the required trade to move from the current bundle to the proposed one
        if (proposedX > this.settledX) {
            const volume = proposedX - this.settledX;
            const price = Math.round((this.settledY - proposedY) / volume);
            this.$.bid_volume_input.value = this.$.currency_scaler.xToHumanReadable(volume);
            this.$.bid_price_input.value = this.$.currency_scaler.yToHumanReadable(price);
            
            this.$.ask_volume_input.value = '';
            this.$.ask_price_input.value = '';
        }
        else {
            const volume = this.settledX - proposedX;
            const price = Math.round((proposedY - this.settledY) / volume);
            this.$.ask_volume_input.value = this.$.currency_scaler.xToHumanReadable(volume);
            this.$.ask_price_input.value = this.$.currency_scaler.yToHumanReadable(price);

            this.$.bid_volume_input.value = '';
            this.$.bid_price_input.value = '';
        }
    }

    _updateProposedBundleBid() {
        let price = parseFloat(this.$.bid_price_input.value);
        price = this.$.currency_scaler.yFromHumanReadable(price);
        let volume = parseFloat(this.$.bid_volume_input.value);
        volume = this.$.currency_scaler.xFromHumanReadable(volume);

        if (isNaN(price) || price < 0 || isNaN(volume) || volume < 0) {
            this.setProperties({
                proposedX: null,
                proposedY: null,
            })
            return;
        }
        
        this.setProperties({
            proposedX: this.settledX + volume,
            proposedY: this.settledY - price * volume,
        });
    }

    _updateProposedBundleAsk() {
        let price = parseFloat(this.$.ask_price_input.value);
        price = this.$.currency_scaler.yFromHumanReadable(price);
        let volume = parseFloat(this.$.ask_volume_input.value);
        volume = this.$.currency_scaler.xFromHumanReadable(volume);
        if (isNaN(price) || price < 0 || isNaN(volume) || volume < 0) {
            this.setProperties({
                proposedX: null,
                proposedY: null,
            })
            return;
        }
        
        this.setProperties({
            proposedX: this.settledX - volume,
            proposedY: this.settledY + price * volume,
        });
    }

    _enter_bid() {
        let price = parseFloat(this.$.bid_price_input.value);
        price = this.$.currency_scaler.yFromHumanReadable(price);
        if (isNaN(price) || price < 0) {
            // this.$.log.error('Can\'t enter bid: invalid price');
            return;
        }

        let volume = parseFloat(this.$.bid_volume_input.value);
        volume = this.$.currency_scaler.xFromHumanReadable(volume);
        if (isNaN(volume) || volume < 0) {
            // this.$.log.error('Can\'t enter bid: invalid volume');
            return;
        }

        this.$.trader_state.enter_order(price, volume, true);
    }

    _enter_ask() {
        let price = parseFloat(this.$.ask_price_input.value);
        price = this.$.currency_scaler.yFromHumanReadable(price);
        if (isNaN(price) || price < 0) {
            // this.$.log.error('Can\'t enter ask: invalid price');
            return;
        }

        let volume = parseFloat(this.$.ask_volume_input.value);
        volume = this.$.currency_scaler.xFromHumanReadable(volume);
        if (isNaN(volume) || volume < 0) {
            // this.$.log.error('Can\'t enter ask: invalid volume');
            return;
        }

        this.$.trader_state.enter_order(price, volume, false);
    }

    // triggered when this player cancels an order
    _order_canceled(event) {
        const order = event.detail;

        this.$.modal.modal_text = 'Are you sure you want to remove this order?';
        this.$.modal.on_close_callback = (accepted) => {
            if (!accepted)
                return;

            this.$.trader_state.cancel_order(order);
        };
        this.$.modal.show();
    }

    // triggered when this player accepts someone else's order
    _order_accepted(event) {
        const order = event.detail;
        if (order.pcode == this.pcode)
            return;

        const price = this.$.currency_scaler.yToHumanReadable(order.price);
        const volume = this.$.currency_scaler.xToHumanReadable(order.volume);

        this.$.modal.modal_text = `Do you want to ${order.is_bid ? 'sell' : 'buy'} ${volume} units for $${price}?`
        this.$.modal.on_close_callback = (accepted) => {
            if (!accepted)
                return;

            this.$.trader_state.accept_order(order);
        };
        this.$.modal.show();
    }

    xToHumanReadable(a) {
        return this.$.currency_scaler.xToHumanReadable(a);
    }
    yToHumanReadable(a) {
        return this.$.currency_scaler.yToHumanReadable(a);
    }
    displayUtilityFunction(x, y) {
        // return a string with the utility value for x and y, with a maximum of 2 decimal points
        return this.utilityFunction(x, y)
            .toFixed(2)
            .replace(/\.?0+$/, '');
    }
}

window.customElements.define('visual-markets', VisualMarkets);
