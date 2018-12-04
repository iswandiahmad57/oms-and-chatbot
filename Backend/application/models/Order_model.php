<?php
class Order_model extends CI_Model {
	public $table_orders='sales_order';


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
    public function tambah_order($data){
        $this->db->insert('sales_order', $data);

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    public function get_order_detail($orderID){
        return $this->db->select('order.*,customer.*,IFNULL((SELECT id from shipment_order so where so.orderID=order.orderID),0) as shipment ')->from('sales_order order')->join('customers customer','order.customerID=customer.customerID')->where('order.orderID',$orderID)->get()->row();
    
    }
    public function get_order_item($orderID){
        $this->db->select('sales_order_item.*,(IF((sales_order_item.extra="Y"),sales_order_item.itemDesc,(SELECT nama FROM products where productID=sales_order_item.productID))) as namaProduk,(SELECT readystock FROM products where productID=sales_order_item.productID) as readystock,(SELECT leftInHand FROM products where productID=sales_order_item.productID) as stok,(SELECT stok FROM products where productID=sales_order_item.productID) as leftInHand, (SELECT image FROM products where productID=sales_order_item.productID) as image,(IF((sales_order_item.extra="Y"),sales_order_item.itemUnitPrice,(SELECT harga FROM products where productID=sales_order_item.productID))) as harga,(SELECT sku FROM products where productID=sales_order_item.productID) as sku');

        return $this->db->where('orderID',$orderID)->order_by('productID','desc')->get('sales_order_item')->result();
    }



    public function get_order($start,$limit,$searchValue=null,$sorting,$keyword,$status=null,$type,$orderFrom){
       $this->db->select('sales_order.*,(SELECT SUM(itemTotal) FROM sales_order_item WHERE sales_order_item.orderID=sales_order.orderID) as jumlah, (SELECT customerName FROM customers where customerID=sales_order.customerID) as customerName');

        if($searchValue!="null"){
            $this->db->like('sales_order.'.$keyword,$searchValue);
        }
        if($status!="null"){
            $this->db->where('orderStatus',$status);
        }

        $this->db->where('orderFrom',$orderFrom);



           
           $this->db->limit($limit,$start); 

           $this->db->order_by('sales_order.orderNumber',$sorting);

        

        return $this->db->where('YEAR(orderDate)',PERIODE)->get('sales_order')->result();
    }
    public function get_orderSim($start,$limit,$searchValue=null,$sorting,$keyword){
        $this->db->select('order.*,(SELECT pro.image FROM sales_order_item item JOIN products pro ON item.productID=item.productID WHERE item.orderID=order.orderID LIMIT 1) as product')->from('sales_order order')->join('customers cust','order.customerID=cust.customerID','left');
        if($searchValue!="null"){
            $this->db->like('order.'.$keyword,$searchValue);
        }

           $this->db->order_by('order.orderNumber',$sorting);

        

        return $this->db->where('YEAR(orderDate)',PERIODE)->get()->result();
    }
    public function get_customer_detail($customerID){
    	return $this->db->where('customerID',$customerID)->get($this->table_customer)->row();
    }
  

    public function addNewItem($newItem=array()){

        $this->db->insert_batch('sales_order_item',$newItem);
       
        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    public function addItem($data){
        $this->db->insert('sales_order_item',$data);
        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
    public function update_order($dataOrder, $dataOrderItem, $orderID){
        $this->db->trans_start();
        //update data order
        $this->db->where('orderID',$orderID)->update('sales_order',$dataOrder);


        //update data order ITem
        foreach ($dataOrderItem as $row) {
            if($row['itemID']!=null){
                $dataEdit=array(
                                "productID"=>$row['productID'],
                                "itemQty"=>$row['itemQty'],
                                "itemUnitPrice"=>$row['itemUnitPrice'],
                                "itemDiscount"=>$row['itemDiscount'],
                                "itemTotal"=>$row['itemTotal'],
                                "itemDesc"=>$row['itemDesc'],
                                "extra"=>$row['extra']);
                                             
                $this->db->where('orderID',$orderID)->where('itemID',$row['itemID'])->update('sales_order_item',$dataEdit);
            }else{
                $dataInput=array(
                                "itemID"=>md5(microtime()),
                                "orderID"=>$orderID,
                                "productID"=>$row['productID'],
                                "itemQty"=>$row['itemQty'],
                                "itemUnitPrice"=>$row['itemUnitPrice'],
                                "itemTotal"=>$row['itemTotal'],
                                "itemDiscount"=>$row['itemDiscount'],
                                "itemDesc"=>$row['itemDesc'],
                                "extra"=>$row['extra']
                                );
                               

                $this->db->insert('sales_order_item',$dataInput);
            }
            

        }        


        if($this->db->trans_complete())
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
    public function tambah_pengiriman($data){
        $this->db->trans_start();

        $this->db->insert('shipment_order',$data);
        $item=array();
        $item['itemID']=md5(microtime());
        $item['itemDesc']="Pengiriman Barang Melalui(".$data['kurir'].")";
        $item['itemUnitPrice']=$data['berat']*$data['harga_pengiriman'];
        $item['itemQty']=1;
        $item['orderID']=$data['orderID'];
        $item['extra']='Y';
        $item['itemTotal']=$item['itemUnitPrice']*$item['itemQty'];

        $this->db->insert('sales_order_item',$item);

        //update data order
        $this->db->where('orderID',$data['orderID'])->update('sales_order',array('orderStatus'=>'Shipping'));

     

        if($this->db->trans_complete())
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
    public function tambah_invoice($data){
   

        $this->db->insert('sales_invoices',$data);
        if($this->db->affected_rows()>0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
   public function update_status($orderID,$status){

        $this->db->where('orderID',$orderID)->update('sales_order',array('orderStatus'=>$status));
        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    //delete 
    public function delete_item($itemID){
         $this->db->where('itemID', $itemID)->delete('sales_order_item');

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }


    //fungsi each parameter ini digunakan untuk mencocokkan parameter yang datang dengan field yang ada di dalam tabel
    public function each_params($table,$specifiedObject){

        //untuk tipe single atau variant
        $fields=$this->db->field_data('sales_order_item');
        $data=array();

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
      



        return $data;

    }

    public function getOrderAll(){
        return $this->db->order_by('orderNumber','desc')->get('sales_order')->result();
    }


}