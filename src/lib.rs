mod cube;
mod moves;
mod utils;

use crate::cube::{facelet::FaceletCube, solvers::pochmann::solve, sub::SubCube};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, rubiks-cube-solver!");
}

#[wasm_bindgen]
pub fn solve_cube(cube: String) -> Result<js_sys::Array, JsValue> {
    match solve(&SubCube::from(cube.parse::<FaceletCube>()?)) {
        Some(solution) => Ok(solution
            .into_iter()
            .map(|mv| JsValue::from_str(&format!("{}", mv)))
            .collect::<js_sys::Array>()),
        None => Err(JsValue::from_str("Cube is unsolveable")),
    }
}
