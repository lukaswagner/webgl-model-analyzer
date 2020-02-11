declare module "worker-loader!*" {
    class FilterWorker extends Worker {
      constructor();
    }
  
    export default FilterWorker;
}
