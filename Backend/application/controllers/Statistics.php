<?php

defined('BASEPATH') OR exit('No direct script access allowed');

// This can be removed if you use __autoload() in config.php OR use Modular Extensions
require APPPATH . '/libraries/REST_Controller.php';

/**
 * This is an example of a few basic user interaction methods you could use
 * all done with a hardcoded array
 *
 * @package         CodeIgniter
 * @subpackage      Rest Server
 * @category        Controller
 * @author          Phil Sturgeon, Chris Kacerguis
 * @license         MIT
 * @link            https://github.com/chriskacerguis/codeigniter-restserver
 */
class Statistics extends REST_Controller {

    function __construct()
    {
        // Construct the parent class
        parent::__construct();

        // Configure limits on our controller methods
        // Ensure you have created the 'limits' table and enabled 'limits' within application/config/rest.php
        $this->methods['user_get']['limit'] = 500; // 500 requests per hour per user/key
        $this->methods['user_post']['limit'] = 100; // 100 requests per hour per user/key
        $this->methods['user_delete']['limit'] = 50; // 50 requests per hour per user/key
        $this->load->model('statistic_model','model',TRUE);
        date_default_timezone_set('Asia/Jakarta');
        $this->load->library('Excel/Classes/PHPExcel');
        
    }

    public function order_get(){

        $result=array();
   
            $resultAll=$this->model->getAllOrder();
    
            $nowadays=date('d');
            $resultBy=$this->model->getOrderByTanggal($nowadays);

  


        $result['allOrder']=$resultAll[0]->jumlah;
        $result['resultBy']=$resultBy[0]->jumlah;

        if(!empty($result)){
            $this->response(['status'=>'Success','data'=>$result], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_OK);
        }
    }
    public function orderDeadline_get(){
        $day=$this->get('day');

        $result=$this->model->getOrderDeadline($day);

        if(!empty($result)){
            $this->response(['status'=>'Success','data'=>$result], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_OK);
        }


    }
    public function invoice_get(){

        $result=$this->model->getInvoice();

        if(!empty($result)){
            $this->response(['status'=>'Success','data'=>$result], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_OK);
        }


    }

    public function report_product_get(){
        $excel=new PHPExcel();



        $filename="oke".'.xls';


        header('Content-Type: application/vnd.ms-excel'); //mime type
        header('Content-Disposition: attachment;filename="'.$filename.'"'); //tell browser what's the file name
        header('Cache-Control: max-age=0'); //no cache
        //save it to Excel5 format (excel 2003 .XLS file), change this to 'Excel2007' (and adjust the filename extension, also the header mime type)
        //if you want to save it as .XLSX Excel 2007 format
        $objWriter = PHPExcel_IOFactory::createWriter($excel, 'Excel5');  
        //force user to download the Excel file without writing it to server's HD
        $objWriter->save('php://output');
    }


}