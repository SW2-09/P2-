
// let matrix_B = {
    //     entries: [[1,2,3],
    //               [4,5,6],
    //               [7,8,9]],
    //     columns: matrixsize,
    //     rows: matrixsize,
    // }
    
    // let matrix_A = {
        //     entries: [[1,2,3],
//              [4,5,6],
//              [7,8,9]],
//     columns: matrixsize,
//     rows: matrixsize,
// }


const matrixsize = 20;

let matrix_B = {
    entries: Array(matrixsize).fill(0).map(() => Array(matrixsize).fill(0).map(() => Math.floor(Math.random() * 10))),
    columns: matrixsize,
    rows: matrixsize,
}

let matrix_A = {
    entries: Array(matrixsize).fill(0).map(() => Array(matrixsize).fill(0).map(() => Math.floor(Math.random() * 10))),
    columns: matrixsize,
    rows: matrixsize,
}

function createSubtask(id,matrixA,matrixb){
    this.id = id;
    this.matrixA = matrixA;
    this.matrixb = matrixb;
}

function matrix_mult(A,B){
    let AColumns = A[0].length;
    let Arows = A.length;
    let Bcolumns = B[0].length;
    let Brows = B.length;
    if (AColumns !== Brows){
        console.log("Matrix multiplication not possible with given matrices");
        return false;
    }
    let matrix_AxB = new Array(Arows);
    for (let index = 0; index < Arows; index++) {
        matrix_AxB[index] = new Array(Bcolumns);
    }

    let count = 0;

    for (let ACurrentRows = 0; ACurrentRows < Arows; ACurrentRows++) {
        for (let BCurrentColumns = 0; BCurrentColumns < Bcolumns; BCurrentColumns++) {
            for (let index = 0; index < Brows; index++) {
                count += A[ACurrentRows][index]*B[index][BCurrentColumns];
            } 
            matrix_AxB[ACurrentRows][BCurrentColumns] = count;  
            count = 0;
        }
    }
    return matrix_AxB;
}

let slicedMatrixA = matrix_A.entries.slice(0,Math.floor(matrix_A.entries.length/2));
let slicedMatrixA2 = matrix_A.entries.slice(Math.floor(matrix_A.entries.length/2),matrix_A.entries.length);

task1 = new createSubtask(1,slicedMatrixA,matrix_B.entries);
task2 = new createSubtask(1,slicedMatrixA2,matrix_B.entries);

let subtask1 = matrix_mult(task1.matrixA,task1.matrixb);
let subtask2 = matrix_mult(task2.matrixA,task2.matrixb);

function combinematrix(A,B){
    return A.concat(B);
}

let finish = combinematrix(subtask1,subtask2);
console.log(finish);

function testMatrixOperation(){
    let matrix_A = [
        [1, 2],
        [3, 4]
    ];

    let matrix_B = [
        [2, 0],
        [1, 2]
    ];

    // Test matrix_mult
    let expectedMatrixMult = [
        [4, 4],
        [10, 8]
    ];

    let multiplyresult = matrix_mult(matrix_A,matrix_B);
    if (JSON.stringify(expectedMatrixMult) === JSON.stringify(multiplyresult))
        console.log("multiply test passed");
    else
        console.log("multiply test failed");

    let expectedCombinedmatrix = [
        [1, 2],
        [3, 4],
        [2, 0],
        [1, 2]
    ];
    let combineresult = combinematrix(matrix_A,matrix_B);
    if (JSON.stringify(expectedCombinedmatrix) === JSON.stringify(combineresult))
        console.log("combine test passed");
    else
        console.log("combine test failed");
}

testMatrixOperation();