import init, {greet} from "wasm-rubiks-cube-solver";

async function runWasm() {
    await init();
    // Now you can use your Wasm functions
    greet();
}

runWasm();