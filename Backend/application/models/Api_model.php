<?php
class Api_model extends CI_Model {
    //model untuk api

    public function getoauth($oauth){
        return false;
    }
    
    // All Language Section
    public function getLanguageAll(){
        return $this->db->select('languageID, languageName, languageCode')->get('languages')->result();
    }
    
    // All Language Section
    public function getOptionalLanguages(){
        return $this->db
                ->distinct()
                ->select('languages.languageID, languageName, languageCode')
                ->from('languages')
                ->join('guidelanguage','guidelanguage.languageID = languages.languageID')
                ->get()
                ->result();
    }
    
    // Popular Language Section
    public function getPopularLanguages(){
        return $this->db
                ->distinct()
                ->select('languages.languageID, languageName, languageCode, (SELECT COUNT(*) FROM customers WHERE languageID = languages.languageID) AS languageFrequency')
                ->from('languages')
                ->join('customers','customers.languageID = languages.languageID')
                ->get()
                ->result();
    }
    
    // Popular Language Section
    public function getPopularLanguageByDestinations($wisataID, $status = null){
        $sts = ($status != null && $status != '')?' AND orderStatus = "'.$status.'"':'';
        return $this->db
                ->distinct()
                ->select('languages.languageID, languageName, languageCode, (SELECT COUNT(*) FROM customers WHERE languageID = languages.languageID) AS languageFrequency')
                ->from('languages')
                ->join('customers','customers.languageID = languages.languageID')
                ->where('customerID IN (SELECT customerID FROM orders WHERE orderID IN (SELECT orderID FROM orderdetail WHERE wisataID = "'.$wisataID.'")'.$sts.')')
                ->get()
                ->result();
    }

    // Popular Destinations Section
    public function getPopularDestinations($status, $wilayahID = null){
        $sts = ($status != null && $status != '')?' AND orderStatus = "'.$status.'"':'';
        $this->db
            ->distinct()
            ->select('wisata.wisataID, wilayah.wilayahID, wilayahNama, wisataName, wisataLat, wisataLng, CONCAT("'.base_url().'",(IF((wisataIcon=NULL OR wisataIcon=""),CONCAT("default.png"),wisataIcon))) AS wisataIcon,CONCAT("'.base_url().'",(IF((wisataCover=NULL OR wisataCover=""),CONCAT("default.png"),wisataCover))) AS wisataCover, (SELECT COUNT(*) FROM orders WHERE orderID = orders.orderID'.$sts.') AS orderFrequency, (SELECT COUNT(*) FROM customers WHERE customerID IN (SELECT customerID FROM orders WHERE orderID = orders.orderID'.$sts.')) AS customerFrequency')
            ->from('orderdetail')
            ->join('orders','orders.orderID = orderdetail.orderID')
            ->join('wisata','wisata.wisataID = orderdetail.wisataID')
            ->join('wilayah','wisata.wilayahID = wilayah.wilayahID');

        if ($wilayahID != null && $wilayahID != ''){
            $this->db->where('wilayah.wilayahID', $wilayahID);
        }

        if ($status != null && $status != ''){
            $this->db->where('orders.orderStatus', $status);
        }

        return $this->db
                ->get()
                ->result();
    }

    // Customer Section
    public function getCustomer($customerID){
        return $this->db
                ->select('customers.customerID, customers.customerCode, customers.customerName, customers.customerEmail, customers.customerPhone, CONCAT("'.base_url().'",(IF((customers.customerPhoto=NULL OR customers.customerPhoto=""),CONCAT("default.png"),customers.customerPhoto))) AS customerPhoto, customers.username, customers.password, languages.languageID, languages.languageCode, languages.languageName')
                ->from('customers')
                ->join('languages','customers.languageID = languages.languageID')
                ->where('customers.customerID', $customerID)
                ->order_by('customerID','ASC')
                ->get()
                ->row();
    }

    public function updateCustomer($id, $data){
        $this->db->where('customerID', $id)->update('customers', $data);

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    function tambah_customer($data=array()){
        $this->db->insert('customers', $data);

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
    //end of customer Section
    
    //Guide Section 
    public function getGuide($id){
        return $this->db
                ->select('guideID, guideCode, guideName, guideEmail, guidePhone, CONCAT("'.base_url().'",(IF((guidePhoto=NULL OR guidePhoto=""),CONCAT("default.png"),guidePhoto))) AS guidePhoto, username, password, wilayah.wilayahID, wilayahNama, saldoNominal, IFNULL((SELECT (SUM(guideratingValue)/COUNT(*)) FROM guiderating WHERE guideID = guides.guideID),0) AS rattingVal')
                ->from('guides')
                ->join('wilayah','guides.wilayahID = wilayah.wilayahID')
                ->where('guideID', $id)
                ->order_by('guideID','ASC')
                ->get()
                ->row();
    }
    
    public function updateGuide($id, $data){
        $this->db->where('guideID', $id)->update('guides', $data);
        
        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    public function updateGuideLanguage($id, $data){
        foreach ($data as $row) {
            $datas['guideID']=$id;
            $datas['guidelanguageID']=md5(microtime());
            $datas['guidelanguageRating']=0;

            $datas['languageID']=$row['languageID'];
            $cekData=$this->db->where('guideID', $id)->where('languageID', $row['languageID'])->limit(1)->get('guidelanguage')->result();

            if(count($cekData)< 1){
                $this->db->insert('guidelanguage', $datas);
            }else{
     
                return TRUE;
            }
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
    
    public function languageByGuide($guideID){
        return $this->db
                ->select('languages.languageID, guideID, languageCode, languageName')
                ->from('guidelanguage')
                ->join('languages','guidelanguage.languageID = languages.languageID')
                ->where('guideId', $guideID)
                ->get()->result();
    }

    public function updateGuideDesc($id, $data){      
        $cekData=$this->db->where('guidelanguageID', $id)->get('guidedescription')->result();
        $datas['guidedescriptionID']=md5(microtime());
        $datas['guidelanguageID']=$id;
        $datas['guidedescriptionContent']=$data['guidedescriptionContent'];
        if(count($cekData)< 1){
            $this->db->insert('guidedescription', $datas);
        }else{
            $this->db->where('guidelanguageID', $id)->update('guideDescription', $data);
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

    public function updateGuideRatting($id, $data){
        $this->db->where('guideID', $id)->update('guides', $data);

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    function tambah_guide($data=array()){
        $this->db->insert('guides', $data);

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
    //End OF Guide Section
    
    //wilayah Section 
    public function getWilayah($parentID, $wilayahType){
        return $this->db
                ->where('parentID', $parentID)
                ->where('wilayahTipe', $wilayahType)
                ->get('wilayah')
                ->result();
    }
    //End Section OF Wilayah

    //wisata Section
    public function getWisata($id, $languageID, $type=null){
        $this->db
            ->select('w.wisataID, w.wilayahID, w.wisataLat, w.wisataLng, CONCAT("'.base_url().'",(IF((w.wisataIcon=NULL OR w.wisataIcon=""),CONCAT("default.png"),w.wisataIcon))) AS wisataIcon, CONCAT("'.base_url().'",(IF((w.wisataCover=NULL OR w.wisataCover=""),CONCAT("default.png"),w.wisataCover))) AS wisataCover, wt.wisataName,wt.wisataContent')
            ->from('wisata w')
            ->join('wisatatranslated wt','w.wisataID=wt.wisataID')
            ->where('wt.languageID', $languageID);
            
            if($type==null){
                $this->db->where('w.wisataID', $id);
            }else{
                $this->db->where('w.wilayahID', $id);
            }
            
            return $this->db->order_by('w.wisataID','ASC')->get()->result();
    }

    public function getGalery($wisataID){
        return $this->db->select('wisataimageID, CONCAT("'.base_url().'",(IF((wisataimageName=NULL OR wisataimageName=""),CONCAT("default.png"),wisataimageName))) AS wisataimageName')->where('wisataID', $wisataID)->get('wisataimages')->result();
    }
    public function getGaleryTimeline($timelineID){
        return $this->db->select('timelineimageID, CONCAT("'.base_url().'",(IF((timelineimageName=NULL OR timelineimageName=""),CONCAT("default.png"),timelineimageName))) AS timelineimageName')->where('timelineID', $timelineID)->get('timelineimages')->result();
    }

    public function updateReadingTimeline($timelineID){
        $this->db->query('UPDATE timelines SET timelineReading = timelineReading+1 WHERE timelineID = "'.$timelineID.'"');
    }
    public function updateReadingWisata($wisataID){
        $this->db->query('UPDATE wisata SET wisataReading = wisataReading+1 WHERE wisataID = "'.$wisataID.'"');
    }
    //End wisata Section

    //Timeline Section 
    public function getTimeline($timelineID, $languageID){
        return $this->db
                ->select('t.timelineID, timelineDate, CONCAT("'.base_url().'",(IF((t.timelineCover=NULL OR t.timelineCover=""),CONCAT("default.png"),t.timelineCover))) AS timelineCover, t.timelineType, tt.timelineTitle, tt.timelineContent')
                ->from('timelines t')
                ->join('timelinetranslated tt','t.timelineID =tt.timelineID')
                ->where('tt.languageID', $languageID)
                ->where('t.timelineID', $timelineID)
                ->get()
                ->result();
    }
    
    public function getSlide($languageID, $type, $limit){
        return $this->db
                ->select('t.timelineID, timelineDate, CONCAT("'.base_url().'",(IF((t.timelineCover=NULL OR t.timelineCover=""),CONCAT("default.png"),t.timelineCover))) AS timelineCover, t.timelineType, tt.timelineTitle, tt.timelineDescription')
                ->from('timelines t')
                ->join('timelinetranslated tt','t.timelineID =tt.timelineID')
                ->where_in('t.timelineType', $type)
                ->where('tt.languageID', $languageID)
                ->limit(0, $limit)
                ->get()
                ->result();
    }
    
    public function searchTimeline($keyword, $language){
        return $this->db
                ->select('t.timelineID, timelineDate, CONCAT("'.base_url().'",(IF((t.timelineCover=NULL OR t.timelineCover=""),CONCAT("default.png"),t.timelineCover))) AS timelineCover, t.timelineType, tt.timelineTitle, tt.timelineDescription')
                ->from('timelines t')
                ->join('timelinetranslated tt','t.timelineID =tt.timelineID')
                ->like('tt.timelineTitle', $keyword)
                ->like('tt.timelineContent', $keyword)
                ->where('tt.languageID', $language)
                ->get()
                ->result();
    }
    
    public function timelines($languageID, $type){
        return $this->db
                ->select('t.timelineID, timelineDate, CONCAT("'.base_url().'",(IF((t.timelineCover=NULL OR t.timelineCover=""),CONCAT("default.png"),t.timelineCover))) AS timelineCover, t.timelineType, tt.timelineTitle, tt.timelineDescription')
                ->from('timelines t')
                ->join('timelinetranslated tt','t.timelineID =tt.timelineID')
                ->where_in('t.timelineType', $type)
                ->where('tt.languageID', $languageID)
                ->get()
                ->result();        
    }
    //End Of Timeline Section

    //Orders Section
    public function saveOrder($data){
        $this->db->insert('orders', $data);

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    public function saverOrderDetail($idOrder, $wisata){
        $orderID=$idOrder;
        foreach ($wisata as $row) {
            $data=array('orderdetailID'=>md5(microtime()),'orderID'=>$orderID);
            $data['wisataID']=$row;
            $this->db->insert('orderdetail', $data);
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

    public function chooseGuide($id, $guide){
        $this->db->trans_start();
        $this->db->where('orderID', $id)->update('orders',array('guideID'=>$guide,'orderStatus'=>'WaitPayment'));
        $this->db->where('orderID', $id)->where('statusBid','Accept')->update('orderbid',array('statusGet'=>'Yes'));

        if($this->db->trans_complete())
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    public function paid($id, $orderStatus){
        $this->db
            ->where('orderID', $id)
            ->where_in('orderStatus', $orderStatus)
            ->update('orders',array(
                'orderPaymentDate'=>date('Y-m-d H:i:s'),
                'orderStatus'=>'WaitConfirm'
            ));

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    public function getGuideList($orderID, $orderStatus){
        return $this->db
                ->select('orders.guideID, orders.languageID as optionalLanguage, customers.languageID as primaryLanguage, guideCode, guideName, CONCAT("'.base_url().'",(IF((guidePhoto=NULL OR guidePhoto=""),CONCAT("default.png"),guidePhoto))) AS guidePhoto, IFNULL((SELECT (SUM(guideratingValue)/COUNT(*)) FROM guiderating WHERE guideID = guides.guideID),0) AS rattingVal')
                ->from('orders')
                ->join('orderbid','orderbid.orderID = orders.orderID', 'right')
                ->join('customers','orders.customerID = customers.customerID')
                ->join('guides','orderbid.guideID = guides.guideID')
                ->where('orders.orderStatus', $orderStatus)
                ->where('orders.orderID', $orderID)
                ->order_by('orders.orderDate','DESC')
                ->get()
                ->result();
    }

    public function getDescription($guideID){
        return $this->db
                ->select('guidelanguage.languageID, languages.languageCode, languages.languageName, IF((guidelanguage.guidelanguageRating = NULL OR guidelanguage.guidelanguageRating = ""),CONCAT(0),guidelanguage.guidelanguageRating) AS guidelanguageRating, guidedescription.guidedescriptionContent')
                ->from('guidelanguage')
                ->join('languages','languages.languageID = guideLanguage.languageID')
                ->join('guidedescription','guideDescription.guidelanguageID = guideLanguage.guidelanguageID','right')
                ->where('guidelanguage.guideID', $guideID)
                ->get()
                ->result();
    }

    public function bidOrder($id, $data){
        $this->db->where('orderbidID', $id)->update('orderbid', $data);

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }      
    }

    public function bid_status($bidID, $dataUpdate){
        $this->db->where('orderbidID', $bidID)->update('orderbid',array('statusBid'=>$dataUpdate));

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    //order history by order ID
    public function getHistoryOrderByOrderID($orderID, $orderStatus){
        return $this->db
                ->select('orderID,orderPaymentDate,orderPaidDate, orders.languageID as optionalLanguage, customers.languageID as primaryLanguage, orders.wilayahID, wilayahNama, orderDateStart, orderDateFinish, orderGender, orderCount, orderComment, orderCode, orderDate, orders.orderStatus')
                ->from('orders')
                ->join('wilayah','orders.wilayahID = wilayah.wilayahID')
                ->join('customers','orders.customerID = customers.customerID')
                ->where('orders.orderID', $orderID)
                ->where_in('orders.orderStatus', $orderStatus)
                ->order_by('orders.orderDate','DESC')
                ->get()
                ->result();
    }

    public function getHistoryOrder($customerID, $orderStatus){
        return $this->db
                ->select('orderID, orders.languageID as optionalLanguage, customers.languageID as primaryLanguage, orders.wilayahID, wilayahNama, orderDateStart,orderPaymentDate,orderPaidDate, orderDateFinish, orderGender, orderCount, orderComment, orderCode, orderDate, orders.orderStatus')
                ->from('orders')
                ->join('wilayah','orders.wilayahID = wilayah.wilayahID')
                ->join('customers','orders.customerID = customers.customerID')
                ->where('orders.customerID', $customerID)
                ->where_in('orders.orderStatus', $orderStatus)
                ->order_by('orders.orderDate','DESC')
                ->get()
                ->result();
    }

    public function getHistoryOrderGuide($orderID, $orderStatus){
        return $this->db
                ->select('guides.guideID, guideCode, CONCAT("'.base_url().'",(IF((guidePhoto=NULL OR guidePhoto=""),CONCAT("default.png"),guidePhoto))) AS guidePhoto, IFNULL((SELECT (SUM(guideratingValue)/COUNT(*)) FROM guiderating WHERE guideID = guides.guideID),0) AS rattingVal')
                ->from('orders')
                ->join('orderbid','orders.orderID = orderbid.orderID')
                ->join('guides','orderbid.guideID = guides.guideID')
                ->join('guiderating','guiderating.guideID=guides.guideID')
                ->where('orders.orderID', $orderID)
                ->where_in('orders.orderStatus', $orderStatus)
                ->order_by('orders.orderDate','DESC')
                ->get()
                ->result();
    }

    public function getHistoryBid($guideID, $orderStatus){
        return $this->db
                ->select('orders.orderID, orders.languageID as optionalLanguage, products.productID, productName, customers.languageID as primaryLanguage, orders.wilayahID, wilayahNama, orderDateStart, orderDateFinish, orderGender, orderCount, orderComment, orders.orderStatus,orderPaymentDate,orderPaidDate, statusBid, statusGet, customers.customerID, customers.customerName, CONCAT("'.base_url().'",(IF((customers.customerPhoto=NULL OR customers.customerPhoto=""),CONCAT("default.png"),customers.customerPhoto))) AS customerPhoto, customerCode')
                ->from('orderbid')
                ->join('orders','orders.orderID=orderbid.orderID')
                ->join('products','orders.productID=products.productID')
                ->join('wilayah','orders.wilayahID = wilayah.wilayahID')
                ->join('customers','orders.customerID = customers.customerID')
                ->where('orderbid.guideID', $guideID)
                ->where_in('orders.orderStatus', $orderStatus)
                ->order_by('orders.orderDate','DESC')
                ->get()
                ->result();
    }

    public function getHistoryBidBy($orderbidID, $orderStatus){
        return $this->db
                ->select('orders.orderID, orders.languageID as optionalLanguage ,products.productID,productName,customers.languageID as primaryLanguage, orders.wilayahID, wilayahNama, orderDateStart, orderDateFinish, orderGender, orderCount, orderComment,statusBid, statusGet,customers.customerID,customers.customerName,CONCAT("'.base_url().'",(IF((customers.customerPhoto=NULL OR customers.customerPhoto=""),CONCAT("default.png"),customers.customerPhoto))) AS customerPhoto,customerCode,statusBid,statusGet')
                ->from('orderbid')
                ->join('orders','orders.orderID=orderbid.orderID')
                ->join('products','orders.productID=products.productID')
                ->join('wilayah','orders.wilayahID = wilayah.wilayahID')
                ->join('customers','orders.customerID = customers.customerID')
                ->where('orderbid.orderbidID', $orderbidID)
                ->where_in('orders.orderStatus', $orderStatus)
                ->order_by('orders.orderDate','DESC')
                ->get()
                ->result();
    }
    
    public function getOrderDetail($orderID){
        return $this->db
                ->select('orderdetail.wisataID, wisataName, CONCAT("'.base_url().'",(IF((wisataCover=NULL OR wisataCover=""),CONCAT("default.png"),wisataCover))) AS wisataCover')->from('orderdetail')
                ->join('wisata','orderdetail.wisataID=wisata.wisataID')
                ->where('orderID', $orderID)
                ->get()
                ->result();
    }

    public function getOrderLanguage($languageID){
        return $this->db
                ->select('languageID, languageCode, languageName')->from('languages')
                ->where('languageID', $languageID)
                ->get()
                ->result();

    }

    public function get_customer($customerID){
        return $this->db->where('customerID', $customerID)->get('customers')->row();
    }

    public function orderCustomerHistory($customerID){
        return $this->db
                ->select('orderID, orders.languageID as optionalLanguage, customers.languageID as primaryLanguage, orders.wilayahID, wilayahNama, orderDateStart,orderPaymentDate,orderPaidDate, orderDateFinish, orderGender, orderCount, orderTotalPayment, orderComment,orderCode,orderDate')
                ->from('orders')
                ->join('wilayah','orders.wilayahID = wilayah.wilayahID')
                ->join('customers','orders.customerID = customers.customerID')
                ->where('orders.customerID', $customerID)
                ->order_by('orders.orderDate','DESC')
                ->get()
                ->result();
    }

    function tambah_topup($data=array()){
        $this->db->insert('topup', $data);

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    function tambah_withdrawals($data=array()){
        $this->db->insert('withdrawals', $data);

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    public function updateStatusWithDraw($drawID,$status){
        $this->db->where('withdrawalID',$drawID)->update('withdrawals',array('withdrawalStatus'=>$status));
        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }

    }

    public function edit_customerSaldoNominal($costumerID, $saldo){
        $this->db->where('customerID', $costumerID)->update('customers',array('saldoNominal'=>$saldo));
        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
    
    public function tambah_guideRating($data){
        $this->db->insert('guiderating', $data);
        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    public function get_drawal($guideID){
        return $this->db->where('guideID', $guideID)->get('withdrawals')->result();
    }

    public function update_guide_nominal($id, $saldo){
        $this->db->where('guideID', $id)->update('guides',array('saldoNominal'=>$saldo));


        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
}
