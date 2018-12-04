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
class Products extends REST_Controller {

    function __construct()
    {
        // Construct the parent class
        parent::__construct();
        date_default_timezone_set('Asia/Jakarta');
        ini_set( 'memory_limit', '200M' );
        ini_set('upload_max_filesize', '200M');
        ini_set('post_max_size', '200M');
        ini_set('max_input_time', 3600);
        ini_set('max_execution_time', 3600);

        $this->allowed_types['file']        = array('pdf','doc','docx','xls','xlsx','ppt','pptx','rtf');
        $this->allowed_types['image']       = array('gif','jpg','jpeg','png','bmp');
        $this->allowed_types['media']       = array('mp3','mp4','qt','mov','wmp');

        // Configure limits on our controller methods
        // Ensure you have created the 'limits' table and enabled 'limits' within application/config/rest.php
        $this->methods['user_get']['limit'] = 500; // 500 requests per hour per user/key
        $this->methods['user_post']['limit'] = 100; // 100 requests per hour per user/key
        $this->methods['user_delete']['limit'] = 50; // 50 requests per hour per user/key
        $this->load->model('product_model','model',TRUE);
        $this->load->library('form_validation');

    }
  
    //tampilkan semua produk yang memiliki jenis produk selain parent dan kalau bisa menggunakan pagination
    function product_get(){

        $itemsPerPage=$this->get('limit');
        $pageNumber=($this->get('start')-1)*$itemsPerPage;
        $search=!empty($this->get('search'))?$this->get('search'):null;
        $sort=$this->get('sort');
        $keyword=$this->get('keyword');

        $jenis=$this->get('jenis');
        
        $product=$this->model->get_product($pageNumber,$itemsPerPage,$search,$sort,$keyword,$jenis);
        $total_row=0;
        if($search!='null'){
            $this->db->like('nama',$search);
            $this->db->where('jenis',$jenis);

             $total_row=count($this->db->get('products')->result());
        }else{
            $type="";
            if($jenis=="Variant"){
                $type="Parent";
            }elseif($jenis=="all"){
                $type="all";
            }else{
                $type="Single";
            }
          
                if($jenis=="all"){
                     $pro=$this->db->where_in('jenis',['Single','Variant']); 
                }else{
                    $pro=$this->db->where('jenis',$type);
                }
            $total_row=count($pro->get('products')->result());
           
        }
        
        if(!empty($product)){
            $this->response(['status'=>'Success','data'=>$product,'total_row'=>$total_row], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array(),'total_row'=>$total_row],REST_Controller::HTTP_OK);
        }
    }

    public function productSimple_get(){

        $product=$this->db->order_by('no','desc')->get('products')->result();
        if(!empty($product)){
            $this->response(['status'=>'Success','data'=>$product], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_OK);
        }
    }
    function productSim_get(){

        $itemsPerPage=$this->get('limit');
        $pageNumber=($this->get('start')-1)*$itemsPerPage;
        $search=!empty($this->get('search'))?$this->get('search'):null;
        $sort=$this->get('sort');
        $keyword=$this->get('keyword');
        
        $product=$this->model->get_productSim($pageNumber,$itemsPerPage,$search,$sort,$keyword);
        $total_row=0;
        if($search!='null'){
            $this->db->like('nama',$search);
             $total_row=count($this->db->get('products')->result());
        }else{

            $total_row=count($this->db->get('products')->result());
           
        }
        
        if(!empty($product)){
            $this->response(['status'=>'Success','data'=>$product,'total_row'=>$total_row], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array(),'total_row'=>$total_row],REST_Controller::HTTP_OK);
        }
    }
    function product_by_get(){
        $productID=$this->get('productID');
        $product=$this->model->get_product_byID($productID);
        if(!empty($product)){
            $this->response(['status'=>'Success','data'=>$product], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_NOT_FOUND);
        }
    }

    function product_variant_type_get(){
        $productID=$this->get('productID');
        $variant=$this->model->get_variant($productID);
        if(!empty($variant)){
            $this->response(['status'=>'Success','data'=>$variant], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_NOT_FOUND);
        }
    }

    function product_ByParent_get(){
        $productID=$this->get('productID');
        $product=$this->model->get_product_byParent($productID);
        if(!empty($product)){
            $this->response(['status'=>'Success','data'=>$product], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_OK);
        }
    }


    function product_single_post(){
        //input data dengan product single tidak memiliki variant
        $data=$this->each_params('products','');
        // var_dump($data);

        $data['productID']=md5(microtime());
        // $_POST=$this->post('produk_parent');
        // var_dump($_POST);
        // var_dump($data);

        if($data['categoryID']=='null'){
            // $data['categoryID']=null;
            unset($data['categoryID']);
        }
        if($data['supplierID']=='null'){
            // $data['supplierID']=null;
            unset($data['supplierID']);
        }


        if($this->model->validasi_tambah($this->post())){
            if($this->model->insert_data($data)){
                $this->response(['status'=>'Success','data'=>(object)array()], REST_Controller::HTTP_OK);
            }else{
                $this->response(['status'=>'Error input','data'=>(object)array()],REST_Controller::HTTP_BAD_REQUEST);
            }
            
        }else{
            $error=array('sku'=>form_error('sku')==""?null:form_error('sku'),
                        'nama'=>form_error('nama')==""?null:form_error('nama'),
                        'jenis'=>form_error('jenis')==""?null:form_error('jenis'));
            $this->response(['status'=>'Error','data'=>(object)array($error)],REST_Controller::HTTP_OK);
        }


    }

    function product_variant_post(){
        //fungsi ini untuk menginput product sekaligus product item dan variant
        // terdapat 3 parameter utama yang dikirimkan produk parent , produk item/child dan variant type
        $produk_variant=$this->each_params('product_variant_types','produk_variant');
        $produk_parent=$this->each_params('products','produk_parent');
        $produk_item=$this->each_params('products','produk_child');

        //tambahkan id ke variabel produk parent dan produk item
        $produk_parent['productID']=md5(microtime());


        //masukkan value baru ke dalam produk Item 

        for ($i=0; $i < count($produk_item) ; $i++) { 
            # code...
            $produk_item[$i]['productID']=md5(microtime());
            $produk_item[$i]['productParentID']=$produk_parent['productID'];
            $produk_item[$i]['jenis']="Variant";

        }

        // masukkan value baru ke dalam produk variant
        for ($i=0; $i < count($produk_variant); $i++) { 
            # code...
            $produk_variant[$i]['productID']=$produk_parent['productID'];
        }


     


        if($this->model->validasi_tambah($this->post('produk_parent'))){
            if($this->model->insert_data($produk_parent)){

                // insertkan product variant nya 
                $this->model->insert_data_variant_types($produk_variant);
                if($this->model->insert_data_variant($produk_item)){
                    $this->response(['status'=>'Success','data'=>(object)array()], REST_Controller::HTTP_OK);
                }else{
                   $this->response(['status'=>'Error input','data'=>array('parent_produk'=>"Success","variant"=>"Error")],REST_Controller::HTTP_BAD_REQUEST); 
                }
            }else{

            }
        }else{
            $error=array('sku'=>form_error('sku')==""?null:form_error('sku'),
                        'nama'=>form_error('nama')==""?null:form_error('nama'),
                        'jenis'=>form_error('jenis')==""?null:form_error('jenis'));
            $this->response(['status'=>'Errorrs','data'=>array($error)],REST_Controller::HTTP_BAD_REQUEST);
        }

        // lalu tambahkan 

    }

    function variant_post(){
        //input data dengan product single tidak memiliki variant
        $data=$this->each_params('products','');
        // var_dump($data);

        $data['productID']=md5(microtime());
        // $_POST=$this->post('produk_parent');
        // var_dump($_POST);
        if($this->model->validasi_tambah($this->post())){
            if($this->model->insert_data($data)){
                $this->response(['status'=>'Success','data'=>(object)array()], REST_Controller::HTTP_OK);
            }else{
                $this->response(['status'=>'Error input','data'=>(object)array()],REST_Controller::HTTP_BAD_REQUEST);
            }
            
        }else{
            $error=array('sku'=>form_error('sku')==""?null:form_error('sku'),
                        'nama'=>form_error('nama')==""?null:form_error('nama'),
                        'jenis'=>form_error('jenis')==""?null:form_error('jenis'));
            $this->response(['status'=>'Errorrs','data'=>array($error)],REST_Controller::HTTP_BAD_REQUEST);
        }

    }

    function product_delete(){
        $param=$_GET['productID'];
         //cek apakah product ID ada didalam database
            //hapus data dari database;
            if($this->model->delete_product($param)){
                 $this->response([
                    'status' => 'Success',
                    'data' => (object)array()
                    ], REST_Controller::HTTP_CREATED); // NO_CONTENT (204) being the HTTP response code               
             }else{
                $this->response([
                    'status' => "Error",
                    'data' => (object)array()
                ], REST_Controller::HTTP_CREATED); // BAD_REQUEST (400) being the HTTP response code                
             }

    }

    function productCollect_post(){
        $param=$this->post();
            if($this->model->delete_productCollect($param)){
                 $this->response([
                    'status' => 'Success',
                    'data' => (object)array()
                    ], REST_Controller::HTTP_CREATED); // NO_CONTENT (204) being the HTTP response code               
             }else{
                $this->response([
                    'status' => "Error",
                    'data' => (object)array()
                ], REST_Controller::HTTP_BAD_REQUEST); // BAD_REQUEST (400) being the HTTP response code                
             }
    }

    function pro_put(){
        var_dump($this->put());
        var_dump(getallheaders());
    }


    function product_edit_post(){
        //input data dengan product single tidak memiliki variant
        $data=$this->each_params('products','','edit');
        // var_dump($data);
         
        // $_POST=$this->post('produk_parent');
        // var_dump($_POST);

        unset($data['no']);
        $stok=$data['stok'];
        $dataProduct=$this->db->where('productID',$data['productID'])->get('products')->row();

        $stokTersedia=$dataProduct->stok-$dataProduct->leftInHand;

        if($stok >=$stokTersedia){
            $data['stok']=($dataProduct->stok + ($data['stok']-$stokTersedia));
        }else{
            $data['stok']=($dataProduct->stok - ($stokTersedia-$data['stok']));
        }
        unset($data['leftInHand']);


       
        if($this->model->update_product($data)){
            $this->response(['status'=>'Success','data'=>(object)array()], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_BAD_REQUEST);
        }
    
    }



    //fungsi each parameter ini digunakan untuk mencocokkan parameter yang datang dengan field yang ada di dalam tabel
    public function each_params($table,$specifiedObject,$operation=null){

        //untuk tipe single atau variant
        $fields=$this->db->field_data($table);
        $data=array();

        if($specifiedObject=="produk_child"){
            for ($i=0; $i < count($this->post($specifiedObject)); $i++) { 
                    # code...
                foreach ($fields as $field) {
                    # code...
           
                        if(@$this->post($specifiedObject)[$i][$field->name]!=null){
                            $data[$i][$field->name]=trim(strtolower($this->post($specifiedObject)[$i][$field->name]));
                        }else{
                            $data[$i][$field->name]=null;
                        }

  

                }
            }
        }else if($specifiedObject=="produk_variant"){
            for ($i=0; $i < count($this->post($specifiedObject)); $i++) { 
                    # code...
                foreach ($fields as $field) {
                    # code...
                    if($field->primary_key!=true){
                        if(@$this->post($specifiedObject)[$i][$field->name]!=null){
                            $data[$i][$field->name]=trim(strtolower($this->post($specifiedObject)[$i][$field->name]));
                        }else{
                            $data[$i][$field->name]=null;
                        }
                    }
                }
            }

        }else{
            foreach ($fields as $field) {
                # code...
                //cek apakah object dalam json terdapat array atau tidak

                if($operation=="edit"){
                        if($specifiedObject!=null){
                            if(@$this->post($specifiedObject)[$field->name]!=null){
                                $data[$field->name]=trim(strtolower($this->post($specifiedObject)[$field->name]));
                            }else{
                                $data[$field->name]=null;
                            }
                        }else{
                            if($this->post($field->name)!=null){
                                $data[$field->name]=trim(strtolower($this->post($field->name)));
                            }else{
                                $data[$field->name]=null;
                            }
                        }
                }else{
                    if($field->primary_key!=true){

                        if($specifiedObject!=null){
                            if(@$this->post($specifiedObject)[$field->name]!=null){
                                $data[$field->name]=trim(strtolower($this->post($specifiedObject)[$field->name]));
                            }else{
                                $data[$field->name]=null;
                            }
                        }else{
                            if($this->post($field->name)!=null){
                                $data[$field->name]=trim(strtolower($this->post($field->name)));
                            }else{
                                $data[$field->name]=null;
                            }
                        }
                    }      
                }


            }     
        }



        return $data;

    }
    public function is_sku_exist()
    {
        $sku=$this->post('sku');
        

        // cek database untuk sku yang sama
        $query = $this->db->get_where('products', array('sku' => $sku));
        if($query->num_rows() > 0)
        {
            $this->form_validation->set_message('is_sku_exist',"SKU ini sudah terdaftar");
            return FALSE;
        }
        else
        {
            return TRUE;
        }
        
    }

    public function uploadmedia_post()
    {

        $pathinfo   = pathinfo($_FILES['file']["name"]);
        $newname    = md5(microtime()).'.'.$pathinfo['extension'];
        $config = array(
            "file_name"     => $newname,
            "overwrite"     => TRUE,
            "upload_path"   => './uploads/produk/',
            "max_size"      => '1000000',
            "allowed_types" => implode('|', $this->allowed_types['image'])
        );

        $this->load->library('upload');
        $this->load->library('image_lib');
        $this->upload->initialize($config);
        
        if ($this->upload->do_upload('file')):
            $this->response(['status'=>'Success','newname'=>$newname,'code'=>'#ER01','message'=>$this->upload->display_errors().', allowed Types:'.implode('|', $this->allowed_types['image']).', your file type are uploaded:'.$pathinfo['extension'],'file'=>$this->upload->data()],REST_Controller::HTTP_OK);
        else:
            $this->response(['status'=>'Error','code'=>'#ER01','message'=>$this->upload->display_errors().', allowed Types:'.implode('|', $this->allowed_types['image']).', your file type are uploaded:'.$pathinfo['extension'],'file'=>$this->upload->data()],REST_Controller::HTTP_NOT_FOUND);
        endif;
    }

    public function unlink_post(){
        $nama_file=$this->post('namaFile');

        unlink('./uploads/produk/'.$nama_file);
        $this->response(['status'=>'Success'],REST_Controller::HTTP_OK);

    }




    public function grafik_penjualan_produk_get(){
        $productID=$this->get('productID');
        $grafik=$this->model->get_grafik_penjualan_produk($productID);
        $grafiks= array();

  

        if($productID=='null'){

            $january=0;
            $februari=0;
            $maret=0;
            $april=0;
            $mei=0;
            $juni=0;
            $juli=0;
            $agustus=0;
            $september=0;
            $oktober=0;
            $november=0;
            $desember=0;
            
            $i=0;
            foreach ($grafik as $row) {
                # code...
              $january+=$row->january;
            $februari+=$row->februari;
            $maret+=$row->maret;
            $april+=$row->april;
            $mei+=$row->mei;
            $juni+=$row->juni;
            $juli+=$row->juli;
            $agustus+=$row->agustus;
            $september+=$row->september;
            $oktober+=$row->oktober;
            $november+=$row->november;
            $desember+=$row->desember;

                    $grafiks[0]['january']=$january;
                    $grafiks[0]['februari']=$februari;
                    $grafiks[0]['maret']=$maret;
                    $grafiks[0]['april']=$april;
                    $grafiks[0]['mei']=$mei;
                    $grafiks[0]['juni']=$juni;
                    $grafiks[0]['juli']=$juli;
                    $grafiks[0]['agustus']=$agustus;
                    $grafiks[0]['september']=$september;
                    $grafiks[0]['oktober']=$oktober;
                    $grafiks[0]['november']=$november;
                    $grafiks[0]['desember']=$desember;



            }


        }
  
 
        if(!empty($grafik)){

            if($productID=='null'){
             $this->response(['status'=>'Success','data'=>(object) $grafiks], REST_Controller::HTTP_OK);
            }else{
                $this->response(['status'=>'Success','data'=>$grafik], REST_Controller::HTTP_OK);
            }
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_NOT_FOUND);
        }
    }


    //get Category

    function category_get(){
        
        $category=$this->model->get_category();
        if(!empty($category)){
            $this->response(['status'=>'Success','data'=>$category], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_NOT_FOUND);
        }
    }
    public function category_post(){

        $data=array();
        foreach ($this->post() as $key=>$value ) {
            # code...
            $data[$key]= $value;    
        }


       if($this->model->insert_data_category($data)){              
                //return $data
             $this->set_response(['status'=>'Success','data'=>(object)array()], REST_Controller::HTTP_CREATED);
        }else{
                // Set the response and exit
                $this->response([
                    'status' => 'Error',
                    'data' => (object)array(),
                ], REST_Controller::HTTP_OK); // NOT_FOUND (404) being the HTTP response code            
        } 
    }

    public function category_delete(){

        $param=$_GET['categoryID'];
         //cek apakah product ID ada didalam database
            //hapus data dari database;
            if($this->model->delete_category($param)){
                 $this->response([
                    'status' => 'Success',
                    'data' => (object)array()
                    ], REST_Controller::HTTP_CREATED); // NO_CONTENT (204) being the HTTP response code               
             }else{
                $this->response([
                    'status' => "Error",
                    'data' => (object)array()
                ], REST_Controller::HTTP_BAD_REQUEST); // BAD_REQUEST (400) being the HTTP response code                
             }

    }


    function supplier_get(){
        
        $supplier=$this->model->get_supplier();
        if(!empty($supplier)){
            $this->response(['status'=>'Success','data'=>$supplier], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_NOT_FOUND);
        }
    }

    function supplierID_get(){
        $id=$this->get('id');
        $supplier=$this->model->get_supplierID($id);
        if(!empty($supplier)){
            $this->response(['status'=>'Success','data'=>$supplier], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_NOT_FOUND);
        }
    }
    public function supplier_post(){

        $data=array();
        foreach ($this->post() as $key=>$value ) {
            # code...
            $data[$key]= $value;    
        }


       if($this->model->insert_data_supplier($data)){              
                //return $data
             $this->set_response(['status'=>'Success','data'=>(object)array()], REST_Controller::HTTP_CREATED);
        }else{
                // Set the response and exit
                $this->response([
                    'status' => 'Error',
                    'data' => (object)array(),
                ], REST_Controller::HTTP_OK); // NOT_FOUND (404) being the HTTP response code            
        } 
    }

    public function supplier_delete(){

        $param=$_GET['id'];
         //cek apakah product ID ada didalam database
            //hapus data dari database;
            if($this->model->delete_supplier($param)){
                 $this->response([
                    'status' => 'Success',
                    'data' => (object)array()
                    ], REST_Controller::HTTP_CREATED); // NO_CONTENT (204) being the HTTP response code               
             }else{
                $this->response([
                    'status' => "Error",
                    'data' => (object)array()
                ], REST_Controller::HTTP_BAD_REQUEST); // BAD_REQUEST (400) being the HTTP response code                
             }

    }

    public function supplier_put(){
        $param=$_GET['id'];

        $data=array();
        $i=0;
        foreach ($this->put() as $key=>$value ) {
            # code...
            if($value != null){
                if($key != 'id'){
                    $data[$key]= trim($value);
                }
                
            }
        }
        

        if($this->model->update_supplier($param, $data)){
           $this->response(['status'=>'Success','data'=>(object)array()], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()], REST_Controller::HTTP_OK);
        }
    

    }

    public function produk_services_post(){

        $produk=$this->db->get('products')->result();

        $this->response(['status'=>'Success','data'=>$produk], REST_Controller::HTTP_OK);

    }

    public function produk_detail_get(){
        $produk=$this->db->where('productID',$this->get('productID'))->get('products')->row();
        // var_dump($this->get());
        if(!empty($produk)){
            $this->response(['status'=>'Success','data'=>$produk], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_NOT_FOUND);
        }
    }

    function produk_service_post(){
        $panjang=$this->post('panjang');
        $lebar=$this->post('lebar');
        $tinggi=$this->post('tinggi');
        $warna=$this->post('warna');
        $jenisKertas=$this->post('jenisKertas');
        //query

        $produk=$this->model->getProdukByParam($lebar,$tinggi,$panjang,$warna,$jenisKertas);

        if(!empty($produk)){
            $this->response(['status'=>'Success','data'=>$produk], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>array()], REST_Controller::HTTP_NOT_FOUND);
        }
        
    }
    
}
