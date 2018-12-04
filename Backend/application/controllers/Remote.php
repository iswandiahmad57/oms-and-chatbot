<?php

defined('BASEPATH') OR exit('No direct script access allowed');

// This can be removed if you use __autoload() in config.php OR use Modular Extensions


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
class Remote extends CI_Controller {

    function __construct()
    {
        // Construct the parent class
        parent::__construct();

         $this->load->library('Excel/Classes/PHPExcel');
         $this->load->model('statistic_model','model',TRUE);
         date_default_timezone_set('Asia/Jakarta');

    }


    public function report_product($month){
        $excel=new PHPExcel();

        $excel->getActiveSheet()->setTitle('Laporan Penjualan per Produk');
    
        $excel->getActiveSheet()->setCellValue('A1', 'Produk');
        $excel->getActiveSheet()->setCellValue('B1', 'Total Pesanan');
        $excel->getActiveSheet()->setCellValue('C1', 'Harga Produk');
        $excel->getActiveSheet()->setCellValue('D1', 'Total Jumlah ');
         $style = array(
            'alignment' => array(
                'horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_CENTER,
                'vertical'=>PHPExcel_Style_Alignment::VERTICAL_CENTER,
            ),
            'font'=>array(
                    'size'=>12,
                    'bold'=>true,
                )
         );


        $excel->getActiveSheet()->getStyle('A1')->applyFromArray($style);
        $excel->getActiveSheet()->getStyle('B1')->applyFromArray($style);
        $excel->getActiveSheet()->getStyle('C1')->applyFromArray($style);
        $excel->getActiveSheet()->getStyle('D1')->applyFromArray($style);

                                         $excel->getActiveSheet()->getStyle('A1')->getFill()->applyFromArray(array(
                                                 'type' => PHPExcel_Style_Fill::FILL_SOLID,
                                                 'startcolor' => array(
                                                 'rgb' => '3498db'
                                                 )
                                         )); 
                                         $excel->getActiveSheet()->getStyle('B1')->getFill()->applyFromArray(array(
                                                 'type' => PHPExcel_Style_Fill::FILL_SOLID,
                                                 'startcolor' => array(
                                                 'rgb' => 'e74c3c'
                                                 )
                                         )); 
                                         $excel->getActiveSheet()->getStyle('C1')->getFill()->applyFromArray(array(
                                                 'type' => PHPExcel_Style_Fill::FILL_SOLID,
                                                 'startcolor' => array(
                                                 'rgb' => 'f1c40f'
                                                 )
                                         )); 
                                         $excel->getActiveSheet()->getStyle('D1')->getFill()->applyFromArray(array(
                                                 'type' => PHPExcel_Style_Fill::FILL_SOLID,
                                                 'startcolor' => array(
                                                 'rgb' => '3498db'
                                                 )
                                         )); 
        $styleArray = array(
          'borders' => array(
            'allborders' => array(
              'style' => PHPExcel_Style_Border::BORDER_THIN
            )
          )
        );   
        $excel->getActiveSheet()->getStyle('A1:D1')->applyFromArray($styleArray); 


        //get statistic 
        $produkReport=$this->model->getProductReport($month);

        $start=2;
        foreach ($produkReport as $row) {
            # code...
             $excel->getActiveSheet()->setCellValue('A'.$start, strtoupper($row->nama));
              $excel->getActiveSheet()->setCellValue('B'.$start, $row->qty);
              $excel->getActiveSheet()->setCellValue('C'.$start,  number_format($row->harga,2,',','.'));
               $excel->getActiveSheet()->setCellValue('D'.$start, number_format($row->jumlah,2,',','.'));

               $start++;
        }

                          $excel->getActiveSheet()->getColumnDimension('A')->setAutoSize(true);
                         $excel->getActiveSheet()->getStyle('A')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
                          $excel->getActiveSheet()->getColumnDimension('B')->setAutoSize(true);
                         $excel->getActiveSheet()->getStyle('B')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
                          $excel->getActiveSheet()->getColumnDimension('C')->setAutoSize(true);
                         $excel->getActiveSheet()->getStyle('C')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER); 
  
   $excel->getActiveSheet()->getColumnDimension('D')->setAutoSize(true);
                         $excel->getActiveSheet()->getStyle('D')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER); 
  
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

    public function report_customer($month){
        $excel=new PHPExcel();

        $excel->getActiveSheet()->setTitle('Transaksi Pelanggan Tahun'.PERIODE);
    
        $excel->getActiveSheet()->setCellValue('A1', 'Nama Pelanggan');
        $excel->getActiveSheet()->setCellValue('B1', 'Email');
        $excel->getActiveSheet()->setCellValue('C1', 'Phone');
        $excel->getActiveSheet()->setCellValue('D1', 'Total Transaksi');
         $style = array(
            'alignment' => array(
                'horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_CENTER,
                'vertical'=>PHPExcel_Style_Alignment::VERTICAL_CENTER,
            ),
            'font'=>array(
                    'size'=>12,
                    'bold'=>true,
                )
         );


        $excel->getActiveSheet()->getStyle('A1')->applyFromArray($style);
        $excel->getActiveSheet()->getStyle('B1')->applyFromArray($style);
        $excel->getActiveSheet()->getStyle('C1')->applyFromArray($style);
        $excel->getActiveSheet()->getStyle('D1')->applyFromArray($style);

                                         $excel->getActiveSheet()->getStyle('A1')->getFill()->applyFromArray(array(
                                                 'type' => PHPExcel_Style_Fill::FILL_SOLID,
                                                 'startcolor' => array(
                                                 'rgb' => '3498db'
                                                 )
                                         )); 
                                         $excel->getActiveSheet()->getStyle('B1')->getFill()->applyFromArray(array(
                                                 'type' => PHPExcel_Style_Fill::FILL_SOLID,
                                                 'startcolor' => array(
                                                 'rgb' => 'e74c3c'
                                                 )
                                         )); 
                                         $excel->getActiveSheet()->getStyle('C1')->getFill()->applyFromArray(array(
                                                 'type' => PHPExcel_Style_Fill::FILL_SOLID,
                                                 'startcolor' => array(
                                                 'rgb' => 'f1c40f'
                                                 )
                                         )); 
                                         $excel->getActiveSheet()->getStyle('D1')->getFill()->applyFromArray(array(
                                                 'type' => PHPExcel_Style_Fill::FILL_SOLID,
                                                 'startcolor' => array(
                                                 'rgb' => '3498db'
                                                 )
                                         )); 
        $styleArray = array(
          'borders' => array(
            'allborders' => array(
              'style' => PHPExcel_Style_Border::BORDER_THIN
            )
          )
        );   
        $excel->getActiveSheet()->getStyle('A1:D1')->applyFromArray($styleArray); 


        //get statistic 
        $customerReport=$this->model->getCustomerReport($month);

        $start=2;
        foreach ($customerReport as $row) {
            # code...
             $excel->getActiveSheet()->setCellValue('A'.$start, strtoupper($row->customerName));
              $excel->getActiveSheet()->setCellValue('B'.$start, $row->email);
              $excel->getActiveSheet()->setCellValue('C'.$start,  $row->phone);
               $excel->getActiveSheet()->setCellValue('D'.$start, number_format($row->total,2,',','.'));

               $start++;
        }

                          $excel->getActiveSheet()->getColumnDimension('A')->setAutoSize(true);
                         $excel->getActiveSheet()->getStyle('A')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
                          $excel->getActiveSheet()->getColumnDimension('B')->setAutoSize(true);
                         $excel->getActiveSheet()->getStyle('B')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
                          $excel->getActiveSheet()->getColumnDimension('C')->setAutoSize(true);
                         $excel->getActiveSheet()->getStyle('C')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER); 
  
        $excel->getActiveSheet()->getColumnDimension('D')->setAutoSize(true);
                         $excel->getActiveSheet()->getStyle('D')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER); 
  
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
    

    public function report_customer_id($id){

      $excel=new PHPExcel();
      $nameCustomer=$this->db->where('customerID',$id)->get('customers')->row()->customerName;

        $excel->getActiveSheet()->setTitle($nameCustomer);
    
        $excel->getActiveSheet()->setCellValue('A1', 'Nomor order');
        $excel->getActiveSheet()->setCellValue('B1', 'Tanggal Order');
        $excel->getActiveSheet()->setCellValue('C1', 'Jumlah Barang');
        $excel->getActiveSheet()->setCellValue('D1', 'Total Transaksi');
         $style = array(
            'alignment' => array(
                'horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_CENTER,
                'vertical'=>PHPExcel_Style_Alignment::VERTICAL_CENTER,
            ),
            'font'=>array(
                    'size'=>12,
                    'bold'=>true,
                )
         );


        $excel->getActiveSheet()->getStyle('A1')->applyFromArray($style);
        $excel->getActiveSheet()->getStyle('B1')->applyFromArray($style);
        $excel->getActiveSheet()->getStyle('C1')->applyFromArray($style);
        $excel->getActiveSheet()->getStyle('D1')->applyFromArray($style);

                                         $excel->getActiveSheet()->getStyle('A1')->getFill()->applyFromArray(array(
                                                 'type' => PHPExcel_Style_Fill::FILL_SOLID,
                                                 'startcolor' => array(
                                                 'rgb' => '3498db'
                                                 )
                                         )); 
                                         $excel->getActiveSheet()->getStyle('B1')->getFill()->applyFromArray(array(
                                                 'type' => PHPExcel_Style_Fill::FILL_SOLID,
                                                 'startcolor' => array(
                                                 'rgb' => 'e74c3c'
                                                 )
                                         )); 
                                         $excel->getActiveSheet()->getStyle('C1')->getFill()->applyFromArray(array(
                                                 'type' => PHPExcel_Style_Fill::FILL_SOLID,
                                                 'startcolor' => array(
                                                 'rgb' => 'f1c40f'
                                                 )
                                         )); 
                                         $excel->getActiveSheet()->getStyle('D1')->getFill()->applyFromArray(array(
                                                 'type' => PHPExcel_Style_Fill::FILL_SOLID,
                                                 'startcolor' => array(
                                                 'rgb' => '3498db'
                                                 )
                                         )); 
        $styleArray = array(
          'borders' => array(
            'allborders' => array(
              'style' => PHPExcel_Style_Border::BORDER_THIN
            )
          )
        );   
        $excel->getActiveSheet()->getStyle('A1:D1')->applyFromArray($styleArray); 


        //get statistic 
        $customerReport=$this->model->getCustomerReportID($id);


        $start=2;
        foreach ($customerReport as $row) {
            # code...
             $excel->getActiveSheet()->setCellValue('A'.$start, strtoupper($row->orderNumber));
              $excel->getActiveSheet()->setCellValue('B'.$start, $row->orderDate);
              $excel->getActiveSheet()->setCellValue('C'.$start,  $row->totalBarang);
               $excel->getActiveSheet()->setCellValue('D'.$start, number_format($row->total,2,',','.'));

               $start++;
        }

                          $excel->getActiveSheet()->getColumnDimension('A')->setAutoSize(true);
                         $excel->getActiveSheet()->getStyle('A')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
                          $excel->getActiveSheet()->getColumnDimension('B')->setAutoSize(true);
                         $excel->getActiveSheet()->getStyle('B')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
                          $excel->getActiveSheet()->getColumnDimension('C')->setAutoSize(true);
                         $excel->getActiveSheet()->getStyle('C')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER); 
  
        $excel->getActiveSheet()->getColumnDimension('D')->setAutoSize(true);
                         $excel->getActiveSheet()->getStyle('D')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER); 
  
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
    

    public function cek_connection(){
        $response = array('status' => 'OK');

        $this->output
                ->set_status_header(200)
                ->set_content_type('application/json', 'utf-8');
                // ->set_output(json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES))
                // ->_display();
    }


}
