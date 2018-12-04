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
class Order extends REST_Controller {

    function __construct()
    {
        // Construct the parent class
        parent::__construct();

        // Configure limits on our controller methods
        // Ensure you have created the 'limits' table and enabled 'limits' within application/config/rest.php
        $this->methods['user_get']['limit'] = 500; // 500 requests per hour per user/key
        $this->methods['user_post']['limit'] = 100; // 100 requests per hour per user/key
        $this->methods['user_delete']['limit'] = 50; // 50 requests per hour per user/key
        date_default_timezone_set('Asia/Jakarta');
        $this->load->model('api_model','api',TRUE);
    }

    public function order_post(){
        $id=md5(microtime());
        $data['orderID']=$id;
        $data['productID']=$this->post('productID');
        $data['customerID']=$this->post('customerID');
        $data['wilayahID']=$this->post('wilayahID');
        $data['languageID']=$this->post('languageID');
        $data['orderCode']=$this->post('orderCode');
        $data['orderDate']=date('YYYY-mm-dd');
        $data['orderDateStart']=$this->post('orderDateStart');
        $data['orderDateFinish']=$this->post('orderDateFinish');
        $data['orderGender']=$this->post('orderGender');
        $data['orderCount']=$this->post('orderCount');
        $data['orderComment']=$this->post('orderComment');

        



        $count=0;
        $key="";
        foreach ($data as $key => $value) {
            # code...
            if($value == null){
                $count=+1;
                $a=$key;
            }
        }


        $data['orderStatus']= "OnSearch";
        // membuat aturan untuk memastikan data yang dikirimkan dari post semuanya lengkap
        if($count > 0 and $this->post('wisataID')!=null){
            $this->response([
                'status' => 'Error'
            ], REST_Controller::HTTP_NOT_FOUND); // NOT_FOUND (404) being the HTTP response code      
        }else{
            if($this->api->saveOrder($data)){
                //masukkan data ke dalam order detail
                $wisata=(object) $this->post('wisataID');
               
                // $wisata=(object)array('wisataID'=>array('15bd6e861886f46ea0cbbd20f40e1d47','2533fff3c3b0a216bbc65d4235da9828'));
                if($this->api->saverOrderDetail($id,$wisata)){
                    $this->set_response(['status'=>'Success'], REST_Controller::HTTP_CREATED);
                }
                 
            }else{
                    // Set the response and exit
                    $this->response([
                        'status' => 'Error'
                    ], REST_Controller::HTTP_NOT_FOUND); // NOT_FOUND (404) being the HTTP response code            
            }
        }

    }

    public function getLastOrder(){
        $orderStatus="OnSearch";


    }

    public function f_put(){
        $param="";
        $parm2="";

        if($this->get()!=null){
            $param=$this->get('orderID');
            $param2=$this->get('guideID');
     
        }else if($_GET != null){
            $param=$_GET['orderID'];
            $param=$_GET['guideID'];
        }else{
            $param=$this->put('orderID');
            $param2=$this->put('guideID');
        }

        $guide=$this->api->chooseGuide($param,$param2);
        if($guide){ //cek apakah terdapat record atau tidak
            $this->response(['status'=>'Success'], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error'],REST_Controller::HTTP_NOT_FOUND);           
        }
    }

    public function paidOrder_put(){
        $param="";


        if($this->get()!=null){
            $param=$this->get('orderID');
   
     
        }else if($_GET != null){
            $param=$_GET['orderID'];
   
        }else{
            $param=$this->put('orderID');
   
        } 
        $paid=$this->api->paid($param);
        if($paid){ //cek apakah terdapat record atau tidak
            $this->response(['status'=>'Success'], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error'],REST_Controller::HTTP_NOT_FOUND);           
        }       
    }

    public function getGuideList_get(){
        $orderStatus='OnChoose';


        $guide=$this->api->getGuideList($orderStatus);
        if(!empty($guide)){ //cek apakah terdapat record atau tidak

            $guidelist = array();

            //get description for guide and put them together
            $i=0;
            foreach ($guide as $row) {

                $description=$this->api->getDescription($row->guideID);
                $detail = array();

                foreach ($row as $key => $value) {
                    $guidelist[$i][$key] = $value;
                }
                
                if(!empty($description)){
                    $guidelist[$i]["guideDescription"] = $description;
                 }else{
                    $guidelist[$i]["guideDescription"] = array();
                 }

                $i++;
            }
            
            $this->response((object)$guidelist, REST_Controller::HTTP_OK);
        }else{
            $this->response(REST_Controller::HTTP_NOT_FOUND);           
        }
    }

    public function bidOrder_post(){
        $param="";
        $parm2="";

        if($this->get()!=null){
            $param=$this->get('orderID');
            $param2=$this->get('guideID');
     
        }else if($_GET != null){
            $param=$_GET['orderID'];
            $param=$_GET['guideID'];
        }else{
            $param=$this->post('orderID');
            $param2=$this->post('guideID');
        }

        $id_bid=md5(microtime());
        $data=array('id_bid'=>$id_bid,'orderID'=>$param,'guideID'=>$param2,'statusBid'=>'Send Notif');
        $guide=$this->api->bidOrder($data);
        if($guide){ //cek apakah terdapat record atau tidak

            $this->response(['status'=>'Success'], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error'],REST_Controller::HTTP_NOT_FOUND);           
        }       
    }
    public function statusBid_put(){
        $param="";
        $param2="";


        if($this->get()!=null){
            $param=$this->get('bidID');
            $param2=$this->get('statusBid');
     
        }else if($_GET != null){
            $param=$_GET['bidID'];
            $param2=$_GET['statusBid'];
        }else{
            $param=$this->put('bidID');
            $param2=$this->put('statusBid');
   
        } 
        $bid=$this->api->bid_status($param,$param2);

        if($bid){ //cek apakah terdapat record atau tidak

            //setelah guide memilih order maka update statusOrder pada tabel orders menjadi onChose

            $orderID=$this->db->where('id_bid',$param)->get('orderbid')->row();
            $cek=$this->db->from('orderbid')->where('orderID',$orderID->orderID)->where('statusBid','Send Notif')->get()->result();

            if(empty($cek)){
                $cek2=$this->db->from('orderbid')->where('orderID',$orderID->orderID)->where('statusBid','Accept')->get()->result();

                if(!empty($cek2)){
                    $orderStatus=array('orderStatus'=>'OnChoose');
                }else{
                    $orederStatus=array('orderStatus'=>'NoResponse');
                }
                $updateorderStatus=$this->db->where('orderID',$orderID->orderID)->update('orders',$orderStatus);                
            }

            $this->response(['status'=>'Success'], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error'],REST_Controller::HTTP_NOT_FOUND);           
        }          
    }

    public function lastOrder_get(){
        $orderStatus='OnSearch';

        //language didapat dari order dan customer(primary);

        
        $orders=$this->api->getLastOrder($orderStatus);

        if(!empty($orders)){ //cek apakah terdapat record atau tidak

            $lastOrder = array();
            


            // //get description for guide and put them together

            $i=0;
            foreach ($orders as $row) {
                $primaryLanguage=$this->api->getOrderLanguage($row->primaryLanguage);
                $optionaLanguage=$this->api->getOrderLanguage($row->optionaLanguage);
                $wisataID=$this->api->getOrderDetail($row->orderID);
                $detail = array();

                foreach ($row as $key => $value) {
                    if($key != "primaryLanguage" ){
                        if($key !="optionaLanguage"){
                         $lastOrder[$i][$key] = $value;
                        }
                    }

                }
                //put language into array lastOrder with object 'Language'
                if(!empty($primaryLanguage)){
                    $primary=array();
                    foreach ($primaryLanguage as $row) {
                        # code...
                        
                        foreach ($row as $key => $value) {
                            # code...
                            $primary[$key]=$value;
                        }
                    }
                    $primary['status']='primary';
                    $lastOrder[$i]["language"][0] = $primary;
                }else{
                     $lastOrder[$i]["language"][0] = array();
                }   

                if(!empty($optionaLanguage)){
                    $optional=array();
                    foreach ($optionaLanguage as $row ) {
                        # code...
                        foreach ($row as $key => $value) {
                            # code...
                            $optional[$key]=$value;
                        }
                        
                    }
                    $optional['status']='optional';
                    $lastOrder[$i]["language"][1] =$optional;
                }else{
                     $lastOrder[$i]["language"][1] = array();
                }  


                if(!empty($wisataID)){
                    $lastOrder[$i]["wisataID"] = $wisataID;
                 }else{
                    $lastOrder[$i]["wisataID"] = array();
                 }

                $i++;
            }
            
            $this->response((object)$lastOrder, REST_Controller::HTTP_OK);
        }else{
            $this->response(REST_Controller::HTTP_NOT_FOUND);           
        }        
    }

    public function orderHistory_get(){
         $orderStatus=array('OnSearch', 'OnChoose', 'WaitPayment','WaitConfirm','Paid','OnService','Done');

        //language didapat dari order dan customer(primary);
        $param="";


        if($this->get()!=null){
            $param=$this->get('customerID');
     
     
        }else if($_GET != null){
            $param=$_GET['customerID'];
          
        }      
        
        $orders=$this->api->getHistoryOrder($param ,$orderStatus);

        if(!empty($orders)){ //cek apakah terdapat record atau tidak

            $lastOrder = array();
            


            // //get description for guide and put them together

            $i=0;
            foreach ($orders as $row) {
                $primaryLanguage=$this->api->getOrderLanguage($row->primaryLanguage);
                $optionaLanguage=$this->api->getOrderLanguage($row->optionaLanguage);
                $wisataID=$this->api->getOrderDetail($row->orderID);
                $detail = array();

                foreach ($row as $key => $value) {
                    if($key != "primaryLanguage" ){
                        if($key !="optionaLanguage"){

                         $lastOrder[$i][$key] = $value;
                        }
                    }

                }
                //put language into array lastOrder with object 'Language'
                if(!empty($primaryLanguage)){
                    $primary=array();
                    foreach ($primaryLanguage as $row) {
                        # code...
                        
                        foreach ($row as $key => $value) {
                            # code...
                            $primary[$key]=$value;
                        }
                    }
                    $primary['status']='primary';
                    $lastOrder[$i]["language"][0] = $primary;
                }else{
                     $lastOrder[$i]["language"][0] = array();
                }   

                if(!empty($optionaLanguage)){
                    $optional=array();
                    foreach ($optionaLanguage as $row ) {
                        # code...
                        foreach ($row as $key => $value) {
                            # code...
                            $optional[$key]=$value;
                        }
                        
                    }
                    $optional['status']='optional';
                    $lastOrder[$i]["language"][1] =$optional;
                }else{
                     $lastOrder[$i]["language"][1] = array();
                }   


                if(!empty($wisataID)){
                    $lastOrder[$i]["wisataID"] = $wisataID;
                 }else{
                    $lastOrder[$i]["wisataID"] = array();
                 }

                $i++;
            }
            
            $this->response($lastOrder, REST_Controller::HTTP_OK);
        }else{
            $this->response(REST_Controller::HTTP_NOT_FOUND);           
        }          
    }
    public function bidHistory_get(){
         $orderStatus=array('OnChoose','Paid','OnService','Done');

        //language didapat dari order dan customer(primary);
        $param="";


        if($this->get()!=null){
            $param=$this->get('guideID');
     
     
        }else if($_GET != null){
            $param=$_GET['guideID'];
          
        }   
        
        $orders=$this->api->getHistoryBid($param,$orderStatus);

        if(!empty($orders)){ //cek apakah terdapat record atau tidak

            $lastOrder = array();
            


            // //get description for guide and put them together

            $i=0;
            foreach ($orders as $row) {
                $primaryLanguage=$this->api->getOrderLanguage($row->primaryLanguage);
                $optionaLanguage=$this->api->getOrderLanguage($row->optionaLanguage);
                $wisataID=$this->api->getOrderDetail($row->orderID);
                $detail = array();

                foreach ($row as $key => $value) {
                    if($key != "primaryLanguage" ){
                        if($key !="optionaLanguage"){

                         $lastOrder[$i][$key] = $value;
                        }
                    }

                }
                //put language into array lastOrder with object 'Language'
                if(!empty($primaryLanguage)){
                    $primary=array();
                    foreach ($primaryLanguage as $row) {
                        # code...
                        
                        foreach ($row as $key => $value) {
                            # code...
                            $primary[$key]=$value;
                        }
                    }
                    $primary['status']='primary';
                    $lastOrder[$i]["language"][0] = $primary;
                }else{
                     $lastOrder[$i]["language"][0] = array();
                }   

                if(!empty($optionaLanguage)){
                    $optional=array();
                    foreach ($optionaLanguage as $row ) {
                        # code...
                        foreach ($row as $key => $value) {
                            # code...
                            $optional[$key]=$value;
                        }
                        
                    }
                    $optional['status']='optional';
                    $lastOrder[$i]["language"][1] =$optional;
                }else{
                     $lastOrder[$i]["language"][1] = array();
                }  


                if(!empty($wisataID)){
                    $lastOrder[$i]["wisataID"] = $wisataID;
                 }else{
                    $lastOrder[$i]["wisataID"] = array();
                 }

                $i++;
            }
            
            $this->response($lastOrder, REST_Controller::HTTP_OK);
        }else{
            $this->response(REST_Controller::HTTP_NOT_FOUND);           
        }          
    }

    // public function chooseGuide_put(){
    //     $param="";
    //     $param2="";


    //     if($this->get()!=null){
    //         $param=$this->get('orderID');
    //         $param2=$this->get('guideID');
     
    //     }else if($_GET != null){
    //         $param=$_GET['orderID'];
    //         $param2=$_GET['guideID'];
    //     }else{
    //         $param=$this->put('orderID');
    //         $param2=$this->put('guideID');
   
    //     }  
    //     $choose=$this->api->choose_guide($param,$param2);

    //     if($bid){ //cek apakah terdapat record atau tidak

    //         //setelah guide memilih order maka update statusOrder pada tabel orders menjadi onChose

    //         $orderID=$this->db->where('id_bid',$param)->get('orderbid')->row();
    //         $cek=$this->db->from('orderbid')->where('orderID',$orderID->orderID)->where('statusBid','Send Notif')->get()->result();

    //         if(empty($cek)){
    //             $cek2=$this->db->from('orderbid')->where('orderID',$orderID->orderID)->where('statusBid','Accept')->get()->result();

    //             if(!empty($cek2)){
    //                 $orderStatus=array('orderStatus'=>'OnChoose');
    //             }else{
    //                 $orederStatus=array('orderStatus'=>'NoResponse');
    //             }
    //             $updateorderStatus=$this->db->where('orderID',$orderID->orderID)->update('orders',$orderStatus);                
    //         }

    //         $this->response(['status'=>'Success'], REST_Controller::HTTP_OK);
    //     }else{
    //         $this->response(['status'=>'Error'],REST_Controller::HTTP_NOT_FOUND);           
    //     }          
    // }
}
