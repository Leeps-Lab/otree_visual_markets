import { html, PolymerElement } from '/static/otree-redwood/node_modules/@polymer/polymer/polymer-element.js';
import '/static/otree-redwood/node_modules/@polymer/polymer/lib/elements/dom-repeat.js';

import './utility-grid.js';

class UtilityGrid extends PolymerElement {
    static get properties() {
        return {
            utilityFunction: Object,
            currentX: Number,
            currentY: Number,
            xBounds: Array,
            yBounds: Array,
            staticGridEnabled: Boolean,
            numRows: {
                type: Number,
                value: 16,
            },
            numCols: {
                type: Number,
                value: 16,
            },
        };
    }

    static get template() {
        return html`
            <style>
                .container {
                    display: flex;
                    font-size: 150%;
                }
                .col {
                    display: flex;
                    flex-direction: column;
                }
                .col > div {
                    padding: 0 5px 0 5px;
                }
                .header-top {
                    font-weight: bold;
                    border-bottom: 1px solid black;
                }
                .header-left {
                    font-weight: bold;
                    border-right: 1px solid black;
                }
                .current-bundle {
                    background-color: lightgreen;
                }
            </style>
            
            <currency-scaler
                id="currency_scaler"
            ></currency-scaler>
        
        <template is="dom-if" if= "{{staticGridEnabled}}">
            <div style="text-align:center">
                <div class="header-top">Static Utility Grid</div>
                <div class="container" >
                    <div class="col header-left">
                            <div class="header-top">Y\\X</div>
                            <template is="dom-repeat" as="y" items="[[ range(yBounds, numRows) ]]">
                                <div>[[ displayY(y) ]]</div>
                            </template>
                    </div>
                <template is="dom-repeat" as="x" items="[[ range(xBounds, numCols) ]]">
                    <div class="col">
                        <div class="header-top">[[ displayX(x) ]]</div>
                        <template is="dom-repeat" as="y" items="[[ range(yBounds, numRows) ]]">
                            <div class$="[[ getCellClass(currentX, currentY, x, y) ]]">[[ displayUtilityFunction(x, y) ]]</div>
                        </template>
                    </div>
                </template>
            </div>
        </template>

        <template is="dom-if" if= "{{ !staticGridEnabled }}">
            <div style="text-align:center">
                <div class="header-top">SELL</div>
                <div class="container" >
                    <div class="col header-left">
                        <div class="header-top">Y\\X</div>
                        <template is="dom-repeat" as="y" items="[[ range(yBounds, numRows) ]]">
                            <div>[[ displayY(y) ]]</div>
                        </template>
                    </div>
                    <template is="dom-repeat" as="x" items="[[ range(xBounds, numCols) ]]">
                        <div class="col">
                            <div class="header-top">[[ displayX(x) ]]</div>
                            <template is="dom-repeat" as="y" items="[[ range(yBounds, numRows) ]]">
                                <div>[[ displaySellUtilityFunction(x, y, currentX, currentY) ]]</div>
                            </template>
                        </div>
                    </template>
                </div>

                <div class="header-top">BUY</div>
                <div class="container">
                <div class="col header-left">
                    <div class="header-top">Y\\X</div>
                    <template is="dom-repeat" as="y" items="[[ range(yBounds, numRows) ]]">
                        <div>[[ displayY(y) ]]</div>
                    </template>
                </div>
                <template is="dom-repeat" as="x" items="[[ range(xBounds, numCols) ]]">
                    <div class="col">
                        <div class="header-top">[[ displayX(x) ]]</div>
                        <template is="dom-repeat" as="y" items="[[ range(yBounds, numRows) ]]">
                            <div>[[ displayBuyUtilityFunction(x, y, currentX, currentY) ]]</div>
                        </template>
                    </div>
                </template>
            </div>
        </template>

            
        `;
    }

    range(bounds, divisions) {
        if (divisions <= 1) {
            return [bounds[0]];
        }

        const arr = [];
        const step = (bounds[1] - bounds[0]) / (divisions - 1);
        for(let i = bounds[0]; i <= bounds[1]; i += step) {
            arr.push(i);
        }
        return arr;
    }

    displayX(x) {
        return this.$.currency_scaler.xToHumanReadable(x)
            .toFixed(2)
            .replace(/\.?0+$/, '');
    }

    displayY(y) {
        return this.$.currency_scaler.yToHumanReadable(y)
            .toFixed(2)
            .replace(/\.?0+$/, '');
    }

    displayUtilityFunction(x, y) {
        // return a string with the utility value for x and y, with a maximum of 2 decimal points

        return this.utilityFunction(x, y)
            .toFixed(2)
            .replace(/\.?0+$/, '')
    }

    displaySellUtilityFunction(x, y, currentX, currentY) {
        // return a string with the utility value for x and y, with a maximum of 2 decimal points

        // return this.utilityFunction(x, y)
        //     .toFixed(1)
        //     .replace(/\.?0+$/, '')

        if (y==0 ||x==0){
            return '-';
        }
        const newX = currentX - x;
        const newY = currentY + ( this.$.currency_scaler.xToHumanReadable(x) * y);
        const currUtil = this.utilityFunction(currentX, currentY);
        const newUtil = this.utilityFunction(newX, newY);
        const ans = newUtil - currUtil
        if (isNaN(ans)){
            return '-';
        }
        return ans.toFixed(2).replace(/\.?0+$/, '')


    }
    displayBuyUtilityFunction(x, y, currentX, currentY) {
        if (y==0 || x==0){
            return '-';
        }       
        const newX = currentX + x;
        const newY = currentY- (this.$.currency_scaler.xToHumanReadable(x) * y);
        const currUtil = this.utilityFunction(currentX, currentY);
        const newUtil = this.utilityFunction(newX, newY);
        const ans = newUtil - currUtil
        if (isNaN(ans)){
            return '-'
        }
        return ans.toFixed(2).replace(/\.?0+$/, '')

    }

    getCellClass(currentX, currentY, cellX, cellY) {
        const xStep = (this.xBounds[1] - this.xBounds[0]) / (this.numCols - 1);
        const nearestX = this.xBounds[0] + Math.round(currentX / xStep) * xStep;
        const yStep = (this.yBounds[1] - this.yBounds[0]) / (this.numRows - 1);
        const nearestY = this.yBounds[0] + Math.round(currentY / yStep) * yStep;


        if (cellX == nearestX && cellY == nearestY) {
            return 'current-bundle';
        }
        return '';
    }
}

window.customElements.define('utility-grid', UtilityGrid);
