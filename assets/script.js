// pixel class
class Pixel {

    constructor(color) {
        // color is the color this pixel should be
        // possibilities include colors, xed
        this.color = color
        // status is the current state of this pixel
        // possibilities include blank, colors, xed
        // initial status is blank
        this.status = PictureGridGame.blank
    }

    cycle() {
        // cycle through the possible statuses
        if(this.status == PictureGridGame.blank) { this.status = PictureGridGame.currentColor }
        else if(PictureGridGame.colors.includes(this.status)) { this.status = PictureGridGame.xed }
        else if(this.status == PictureGridGame.xed) { this.status = PictureGridGame.blank }
    }

    setStatus(newStatus) {
        // set status manually
        this.status = newStatus
    }

    mistake() {
        // a pixel has been incorrectly marked if it isn't blank and the color doesn't match the status
        if(this.status == PictureGridGame.blank || this.status == this.color) {
            return false
        }
        return true
    }

    coloredBlank() {
        // a colored pixel is marked as blank
        if(this.status == PictureGridGame.blank && this.color != PictureGridGame.xed) {
            return true
        }
        return false
    }
    
    getColor() {
        return this.color
    }
    getStatus() {
        return this.status
    }
}

class PictureGridGame {
    // drawing grid
    gameBoard = document.getElementById("gameBoard")
    grid = document.getElementById("grid")

    // possible statuses
    static blank = null // not marked yet
    static xed = 'x' // marked with an x
    static colors = ["#000000"] // list of colors included in game, starting with black
    static currentColor = PictureGridGame.colors[0]

    constructor() {
        // game is won
        this.won = false

        // number of pixel rows/cols
        this.dimensions = 10
        // size of each pixel
        this.size = 40

        // array of pixels
        this.pixels = []

        // arrays of col/row numbers
        this.rows = []
        this.cols = []

        // total number of colored pixels
        this.totalColored = 0
        this.possibilities = [PictureGridGame.xed].concat(PictureGridGame.colors)
    }

    createPixels(n) {
        // draw n by n grid of tiles, populate pixels array
        // give each pixel a random color, or xed
        // keep a running total of colored pixels in totalColored
        this.pixels = new Array(n)
        for(let y = 0; y < n; y++) {
            // rows
            this.pixels[y] = new Array(n)
            for(let x = 0; x < n; x++) {
                // cols
                let i = (Math.floor(Math.random() * this.possibilities.length))
                let color = this.possibilities[i]
                if(i > 0) { this.totalColored++ }
                let pixel = new Pixel(color)
                this.pixels[y][x] = pixel
            }
        }
    }

    countBlocks() {
        // loop through rows and columns and count the number and size of each block of colored pixels
        // start with rows
        let n = this.pixels.length
        for(let y = 0; y < n; y++) {
            let list = []
            let currentBlock = 0;
            for(let x = 0; x < n; x++) {
                if(PictureGridGame.colors.includes(this.pixels[y][x].getColor())) {
                    currentBlock++
                } else if(this.pixels[y][x].getColor() == PictureGridGame.xed && currentBlock > 0) {
                    list.push(currentBlock)
                    currentBlock = 0
                }
            }
            if(currentBlock > 0) {
                list.push(currentBlock)
            }
            this.rows.push(list)
        }
        // now columns
        for(let x = 0; x < n; x++) {
            let list = []
            let currentBlock = 0;
            for(let y = 0; y < n; y++) {
                if(PictureGridGame.colors.includes(this.pixels[y][x].getColor())) {
                    currentBlock++
                } else if(this.pixels[y][x].getColor() == PictureGridGame.xed && currentBlock > 0) {
                    list.push(currentBlock)
                    currentBlock = 0
                }
            }
            if(currentBlock > 0) {
                list.push(currentBlock)
            }
            this.cols.push(list)
        }
    }

    drawGrid() {
        // output a grid representing all the pixels
        let n = this.pixels.length
        // clear grid
        grid.innerHTML = ""
    
        // loop thru pixels
        let colCellElem = document.createElement("div")
        colCellElem.setAttribute("class", "cell")
        grid.appendChild(colCellElem)
        for(let i = 0; i < n; i++) {
            colCellElem = document.createElement("div")
            colCellElem.setAttribute("class", "cell")
            colCellElem.style.width = this.size + "px"
            colCellElem.innerText = this.cols[i].join("\n")
            grid.appendChild(colCellElem)
        }
        for(let y = 0; y < n; y++) {
            // rows
            let rowCellElem = document.createElement("div")
            rowCellElem.setAttribute("class", "cell")
            rowCellElem.innerText = this.rows[y].join(" ")
            grid.appendChild(rowCellElem)
            for(let x = 0; x < n; x++) {
                // cols
                let pixelObj = this.pixels[y][x]
                let pixelElem = document.createElement("div")
                pixelElem.setAttribute("class", "pixel")
                pixelElem.setAttribute("key", y.toString() + x.toString())
                pixelElem.onclick = handleClick
                pixelElem.style.height = this.size + "px"
                pixelElem.style.width = this.size + "px"
                if(pixelObj.getStatus() == PictureGridGame.xed) {
                    // draw an x thru square https://www.codeease.net/programming/javascript/draw-a-diagonal-line-in-a-div
                    pixelElem.innerText = "x"
                } else if (pixelObj.getStatus() != PictureGridGame.blank) {
                    // color the pixel
                    pixelElem.style.background = pixelObj.getStatus()
                }
                grid.appendChild(pixelElem)
            }
        }
    }

    clickPixel(x, y) {
        // send a click signal to a pixel and redraw the grid
        this.pixels[y][x].cycle()
        this.drawGrid()
    }

    checkCorrect() {
        // check if any marked pixels are wrong
        let mistakes = 0
        let n = this.pixels.length
        for(let y = 0; y < n; y++) {
            for(let x = 0; x < n; x++) {
                if(this.pixels[y][x].mistake()) {
                    mistakes++
                }
            }
        }
        return mistakes;
    }

    checkForBlanks() {
        // check if there any any colored pixels marked blank
        let blanks = 0
        let n = this.pixels.length
        for(let y = 0; y < n; y++) {
            for(let x = 0; x < n; x++) {
                if(this.pixels[y][x].coloredBlank()) {
                    blanks++
                }
            }
        }
        return blanks;
    }

    win() {
        this.won = true
        let winMsgElem = document.createElement("h2")
        winMsgElem.innerText = "You won!"
        this.gameBoard.appendChild(winMsgElem)
    }
    
    playGame() {
        // run the game
        gameBoard.style.width = (this.size * this.dimensions * 1.3).toString() + "px"
        grid.style.gridTemplateColumns = "auto " + (this.size + "px ").repeat(this.dimensions)
        this.createPixels(this.dimensions)
        this.countBlocks()
        this.drawGrid()
    }
}

function handleClick() {
    if(game.won) { return }
    let key = this.getAttribute("key")
    let y = parseInt(key[0])
    let x = parseInt(key[1])
    game.clickPixel(x, y)
    if(game.checkCorrect() == 0 && game.checkForBlanks() == 0) {
        // win!
        game.win()
    }
}

game = new PictureGridGame()

game.playGame()