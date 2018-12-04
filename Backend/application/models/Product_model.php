<?php
class Product_model extends CI_Model {
	public $table_product='products';
	public $table_variant='product_variant_types';

	public $table_category='product_categories';

    function run($module = '', $group = '') {
        (is_object($module)) AND $this->CI = &$module;
        return parent::run($group);
    }
    public function rules_tambah()
    {
        $form = array(
                        array(
                            'field' => 'sku',
                            'label' => 'SKU',
                            'rules' => "required|callback_is_sku_exist"
                        ),
                        array(
                            'field' => 'nama',
                            'label' => 'Nama',
                            'rules' => 'required'
                        ),
                        array(
                            'field' => 'jenis',
                            'label' => 'jenis',
                            'rules' => 'required'
                        )

        );
        return $form;
    }

    public function validasi_tambah($post)
    {
    	$_POST=$post;

        $form = $this->rules_tambah();
        $this->form_validation->set_rules($form);

        if ($this->form_validation->run())
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    public function insert_data($data){
    	$this->db->insert($this->table_product, $data);

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    public function insert_data_variant($data){
    	$this->db->insert_batch($this->table_product,$data);
    	if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }


    public function insert_data_variant_types($data){

    	$this->db->insert_batch($this->table_variant, $data);
        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }

    }

    public function insert_data_category($data){
    	$this->db->insert($this->table_category, $data);
        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }


    public function insert_data_supplier($data){
        $this->db->insert('suppliers', $data);
        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }


    // GET Data

    public function get_category(){
    	 return $this->db->get($this->table_category)->result();
    }

    public function get_supplier(){
        return $this->db->get('suppliers')->result();
    }
    public function get_supplierID($id){
        return $this->db->where('id',$id)->get('suppliers')->row();
    }

    public function get_product($start,$limit,$searchValue=null,$sorting,$keyword,$jenis){
    
        if($searchValue!="null"){
            $this->db->like($keyword,$searchValue);
        }
          if($jenis=="Variant"){
              $this->db->where('jenis','Parent');  
          }elseif($jenis=="all"){
                $this->db->where_in('jenis',['Single','Variant']);
                
          }else{
            $this->db->where('jenis',$jenis);
          }
           
           $this->db->limit($limit,$start); 

           $this->db->order_by('no',$sorting);

        

        return $this->db->get($this->table_product)->result();
    }
    public function get_productSim($start,$limit,$searchValue=null,$sorting,$keyword){
    
        if($searchValue!="null"){
            $this->db->like($keyword,$searchValue);
        }

           $this->db->order_by('no',$sorting);

        

        return $this->db->get($this->table_product)->result();
    }

    public function get_product_byID($productID){
    	return $this->db->where('productID',$productID)->get($this->table_product)->row();
    }
    public function get_product_byParent($productID){
    	return $this->db->where('productParentID',$productID)->get($this->table_product)->result();
    }
    public function get_variant($productID){
    	return $this->db->where('productID',$productID)->get($table_variant)->result();
    }

    //delete 
    public function delete_product($productID){
      	 $this->db->where('productID', $productID)->delete($this->table_product);

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
    public function delete_category($categoryID){
         $this->db->where('categoryID', $categoryID)->delete($this->table_category);

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
    public function delete_supplier($supplierID){
         $this->db->where('id', $supplierID)->delete('suppliers');

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
    public function delete_productCollect($productID){

        for ($i=0; $i <count($productID) ; $i++) { 
            # code...
            $this->db->where('productID', $productID[$i])->delete($this->table_product);
        }
         

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    public function update_product($data){

        $this->db->where('productID',$data['productID'])->update($this->table_product,$data);
        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    public function update_supplier($param,$data){

        $this->db->where('id',$param)->update('suppliers',$data);
        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    public function is_sku_exist()
    {
    	 $this->form_validation->set_message('is_sku_exist',"SKU ini sudah terdaftar");
        $sku=$this->post('sku');
        // cek database untuk sku yang sama
        $query = $this->db->get_where('products', array('sku' => $sku));
        if($query->num_rows() > 0)
        {
           
            return FALSE;
        }
        else
        {
            return TRUE;
        }
        
    }

    public function get_grafik_penjualan_produk($productID){

        if($productID=='null'){
            $query=
            "SELECT (SELECT  IFNULL(SUM(itemQty),0) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=01 AND items.productID=itmp.productID AND YEAR(orders.orderDate)=".PERIODE.") as january
            ,(SELECT IFNULL(SUM(itemQty),0) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=02 AND items.productID=itmp.productID AND YEAR(orders.orderDate)=".PERIODE.")as februari
            ,(SELECT IFNULL(SUM(itemQty),0  ) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=03 AND items.productID=itmp.productID AND YEAR(orders.orderDate)=".PERIODE.")as maret
            ,(SELECT IFNULL(SUM(itemQty),0  ) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=04 AND items.productID=itmp.productID AND YEAR(orders.orderDate)=".PERIODE.")as april
            ,(SELECT IFNULL(SUM(itemQty),0 ) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=05  AND items.productID=itmp.productID AND YEAR(orders.orderDate)=".PERIODE.")as mei
            ,(SELECT IFNULL(SUM(itemQty),0 ) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=06 AND items.productID=itmp.productID AND YEAR(orders.orderDate)=".PERIODE.")as juni
            ,(SELECT IFNULL(SUM(itemQty),0 ) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=07 AND items.productID=itmp.productID AND YEAR(orders.orderDate)=".PERIODE.")as juli
            ,(SELECT IFNULL(SUM(itemQty),0  ) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=08 AND items.productID=itmp.productID AND YEAR(orders.orderDate)=".PERIODE.")as agustus
            ,(SELECT IFNULL(SUM(itemQty),0 ) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=09 AND items.productID=itmp.productID AND YEAR(orders.orderDate)=".PERIODE.")as september
            ,(SELECT IFNULL(SUM(itemQty),0  ) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=10 AND items.productID=itmp.productID AND YEAR(orders.orderDate)=".PERIODE.")as oktober
            ,(SELECT IFNULL(SUM(itemQty),0 ) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=11 AND items.productID=itmp.productID AND YEAR(orders.orderDate)=".PERIODE.")as november
            ,(SELECT IFNULL(SUM(itemQty),0 ) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=12 AND items.productID=itmp.productID AND YEAR(orders.orderDate)=".PERIODE.")as desember


            FROM products itmp ";

        }else{
            $query=
            "SELECT(SELECT  IFNULL(SUM(itemQty),0) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=01 AND items.productID='$productID' AND YEAR(orders.orderDate)=".PERIODE.")as january
            ,(SELECT IFNULL(SUM(itemQty),0) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=02 AND items.productID='$productID' AND YEAR(orders.orderDate)=".PERIODE.")as februari
            ,(SELECT IFNULL(SUM(itemQty),0) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=03 AND items.productID='$productID' AND YEAR(orders.orderDate)=".PERIODE.")as maret
            ,(SELECT IFNULL(SUM(itemQty),0) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=04 AND items.productID='$productID' AND YEAR(orders.orderDate)=".PERIODE.")as april
            ,(SELECT IFNULL(SUM(itemQty),0) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=05 AND items.productID='$productID' AND YEAR(orders.orderDate)=".PERIODE.")as mei
            ,(SELECT IFNULL(SUM(itemQty),0) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=06 AND items.productID='$productID' AND YEAR(orders.orderDate)=".PERIODE.")as juni
            ,(SELECT IFNULL(SUM(itemQty),0) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=07 AND items.productID='$productID' AND YEAR(orders.orderDate)=".PERIODE.")as juli
            ,(SELECT IFNULL(SUM(itemQty),0) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=08 AND items.productID='$productID' AND YEAR(orders.orderDate)=".PERIODE.")as agustus
            ,(SELECT IFNULL(SUM(itemQty),0) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=09 AND items.productID='$productID' AND YEAR(orders.orderDate)=".PERIODE.")as september
            ,(SELECT IFNULL(SUM(itemQty),0) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=10 AND items.productID='$productID' AND YEAR(orders.orderDate)=".PERIODE.")as oktober
            ,(SELECT IFNULL(SUM(itemQty),0) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=11 AND items.productID='$productID' AND YEAR(orders.orderDate)=".PERIODE.")as november
            ,(SELECT IFNULL(SUM(itemQty),0) FROM sales_order_item items join sales_order orders on items.orderID=orders.orderID where MONTH(orders.orderDate)=12 AND items.productID='$productID' AND YEAR(orders.orderDate)=".PERIODE.")as desember

            FROM products p where p.productID='$productID' ";
        }
        



        return $this->db->query($query)->result();
    }


    public function getProdukByParam($lebar,$tinggi,$panjang,$warna,$jenisKertas){

        $this->db->where('width',$lebar)->where('height',$tinggi)->where('length',$panjang)->like('warna',$warna)->like('JenisKertas',$jenisKertas)->where('readystock','N');
        $q=$this->db->get('products');

        if($q->num_rows() > 0){
            return $q->result();
        }else{
            $as=$this->db->where('warna',$warna)->where('JenisKertas',$jenisKertas)->where('readystock','N')->order_by('no','DESC');
           
         
            return  $as->get('products')->result();
        }
    }



}