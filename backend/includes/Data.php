<?php
/**
 * class for retrieving and persisting data from/to a json file
 */

class Data
{
    private $filename = 'data.json';
    private $fileDirectory;
    private $filePath;

    protected $data = [];

    public function __construct()
    {
        $this->fileDirectory = dirname(__DIR__) . '/store';
        $this->initialize();
        $this->buffer();
    }

    public function read($path)
    {
        $tokens = explode('.', $path);
        $data = $this->data;

        foreach ($tokens as $token) {
            if (isset($data[$token])) {
                $data = $data[$token];
            } else {
                return null;
            }
        }

        return $data;
    }

    protected function initialize()
    {
        if (!is_dir($this->fileDirectory)) {
            mkdir($this->fileDirectory, 0777, true);
        }
        $this->filePath = $this->fileDirectory . '/' . $this->filename;
        if (!file_exists($this->filePath)) {
            file_put_contents($this->filePath, json_encode([], JSON_PRETTY_PRINT));
        }
    }
    protected function buffer()
    {
        $file = file_get_contents($this->filePath);
        $this->data = json_decode($file, true) ?: [];
    }

    public function store($path, $value)
    {
        $tokens = explode('.', $path);
        $data = &$this->data; // use reference here too

        foreach ($tokens as $token) {
            if (!isset($data[$token])) {
                $data[$token] = [];
            }
            $data = &$data[$token]; // reference ensures nested data is updated
        }

        $data = $value;

        $json = json_encode($this->data, JSON_PRETTY_PRINT);
        file_put_contents($this->filePath, $json);
    }
}
