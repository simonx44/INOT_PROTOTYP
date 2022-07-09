// Define our labelmap
const labelMap = {
1: {"name": "jacket", "id": 1},
    2: {"name": "krawatte", "id": 2},
    3: {"name": "kleid", "id": 3},
    4:{"name": "rock", "id": 4},
    5:{"name": "jogginghose", "id": 5},
    6:{"name": "joggingjacke", "id": 6},
    7:{"name": "shorts", "id": 7},
    8:{"name": "tanktop", "id": 8},
    9:{"name": "freizeithemd", "id": 9},
    10:{"name": "strohhut", "id": 10},
    11:{"name": "tshirt", "id": 11}
}



// Define a drawing function
export const drawRect = (boxes:any, classes:any, scores:any, threshold:any, imgWidth: number, imgHeight: number, ctx : any)=>{
    for(let i=0; i<=boxes.length; i++){
        if(boxes[i] && classes[i] && scores[i]>threshold){
            // Extract variables
            const [y,x,height,width] = boxes[i]
            const text = classes[i]

            // Set styling
            // @ts-ignore
            ctx.strokeStyle = labelMap[text]['color']
            ctx.lineWidth = 5
            ctx.fillStyle = 'white'
            ctx.font = '30px Arial'

            console.log("draw")


            // DRAW!!
            ctx.beginPath()
            // @ts-ignore
            ctx.fillText(labelMap[text]['name'] + ' - ' + Math.round(scores[i]*100)/100, x*imgWidth, y*imgHeight-10)
            ctx.rect(x*imgWidth, y*imgHeight, width*imgWidth/2, height*imgHeight/2);
            ctx.stroke()
        }
    }
}