import { randomMatrix } from "../../helper_functions.js";
import { assert } from "chai";
import crypto from "crypto";

describe("createJob.js", () => {
    describe("validateMatrix", () => {
        it("Should validate the uploaded matrix (client specific)", () => {
            let testMatrix = randomMatrix(10, 10, 100);

            assert.isTrue(validateMatrix(testMatrix, testMatrix));
        });
        it("Should return false if matrix is invalid", () => {
            let corruptedMatrix;
            let countExpected = 10;
            let count = 0;
            let parses = [];

            for (let i = 0; i < 7425; i++) {
                let testMatrix = randomMatrix(2, 2, 10);
                insertCharInMatrix(testMatrix, 2, 2, i);

                let troubleIndicies=[9,10,11,12,32,48,49,50,51,52,53,54,55,56,57,160,5760];
                if(troubleIndicies.includes(i)){
                    console.log(i, testMatrix);
                }
            

                if (validateMatrix(testMatrix, testMatrix)) {
                    count++;
                    parses.push(i);
                }
            }
            for (let i = 0; i < parses.length; i++) {
                console.log(
                    i,
                    parses[i],
                    characters[parses[i]],
                    typeof characters[parses[i]]
                );
            }

            assert.equal(count, countExpected);
        });
    });
});

function insertCharInMatrix(matrix, rows, columns, index) {
    let row = Math.floor(rows * Math.random());
    let coloumn = Math.floor(columns * Math.random());

    matrix[row][coloumn] = characters[index];

    return matrix;
}

let characters = "";
for (let i = 0; i < 7425; i++) {
    characters += String.fromCharCode(i);
}

function validateMatrix(matrixA, matrixB) {
    try {
        //Check dimensions of matricies
        if (matrixA[0].length !== matrixB.length) {
            throw new Error("Matrix dimensions do not match.");
        }
        let troubleChars = ['\t', '\n', '\x0B', '\f', ' ',];

        // Check MatrixA
        for (let rowA = 0; rowA < matrixA.length; rowA++) {
            for (let colA = 0; colA < matrixA[rowA].length; colA++) {
                if (isNaN(matrixA[rowA][colA])) {
                    throw new Error("Matrix A is corrupted.");
                }
                for (let i = 0; i < troubleChars.length; i++) {
                    if (matrixA[rowA][colA] === troubleChars[i]) {
                        throw new Error("Matrix A is corrupted.");
                    }
                }
            }
        }

        // Check MatrixB
        for (let rowB = 0; rowB < matrixB.length; rowB++) {
            for (let colB = 0; colB < matrixB[rowB].length; colB++) {
                if (isNaN(matrixB[rowB][colB])) {
                    throw new Error("Matrix B is corrupted.");
                }
            }
        }
    } catch (err) {
        //alert(err + " Please choose valid matricies.");
        return false;
    }
    return true;
}
