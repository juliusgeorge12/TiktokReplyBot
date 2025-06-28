<?php

class Logger
{
    private $filename = 'log.txt';
    private $fileDirectory;
    private $filePath;

    protected $data = [];

    public function __construct()
    {
        $this->fileDirectory = dirname(__DIR__) . '/logs';
        $this->initialize();
        $this->buffer();
    }

    public function log($message, $level = 'info')
    {
        $entry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'level' => $level,
            'message' => $message
        ];
        $this->data[] = $entry;
        $this->persist();
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
        //parse the log into an array
        $lines = explode("\n", trim($file));
        foreach ($lines as $line) {
            if (trim($line) !== '') {
                preg_match('/\[(.*?)\] \[(.*?)\]: (.*)/', $line, $matches);
                if (count($matches) === 4) {
                    $this->data[] = [
                        'timestamp' => $matches[1],
                        'level' => strtolower($matches[2]),
                        'message' => $matches[3]
                    ];
                }
            }
        }
    }

    protected function persist()
    {
        $entry = end($this->data);
        $text = '';
        $text .= sprintf("[%s] [%s]: %s\n", $entry['timestamp'], strtoupper($entry['level']), $entry['message']);
        $text .= "\n";
        file_put_contents($this->filePath, $text, FILE_APPEND);
    }
    public function readLogs()
    {
        return $this->data;
    }
    public function clearLogs()
    {
        $this->data = [];
        file_put_contents($this->filePath, '');
    }
}
